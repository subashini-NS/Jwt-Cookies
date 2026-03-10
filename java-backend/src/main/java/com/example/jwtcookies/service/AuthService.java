package com.example.jwtcookies.service;

import com.example.jwtcookies.config.AppProperties;
import com.example.jwtcookies.dto.AuthRequest;
import com.example.jwtcookies.exception.ApiException;
import com.example.jwtcookies.model.Permission;
import com.example.jwtcookies.model.RefreshToken;
import com.example.jwtcookies.model.Role;
import com.example.jwtcookies.model.User;
import com.example.jwtcookies.repository.PermissionRepository;
import com.example.jwtcookies.repository.RefreshTokenRepository;
import com.example.jwtcookies.repository.RoleRepository;
import com.example.jwtcookies.repository.UserRepository;
import com.example.jwtcookies.security.CurrentUser;
import com.example.jwtcookies.security.JwtService;
import com.example.jwtcookies.util.CookieUtil;
import com.example.jwtcookies.util.HashUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AppProperties appProperties;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AppProperties appProperties
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.appProperties = appProperties;
    }

    public Map<String, Object> register(AuthRequest request, HttpServletResponse response) {
        String email = normalizeEmail(request.email());

        if (userRepository.findByEmail(email).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "User already exists");
        }

        Role fallbackRole = getFallbackRole().orElseThrow(() ->
                new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "No roles configured. Run the seed script and try again."));

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(fallbackRole.getId());
        user.setIsActive(true);
        user = userRepository.save(user);

        issueNewSession(user, response);
        return Map.of("message", "Registration successful");
    }

    public Map<String, Object> login(AuthRequest request, HttpServletResponse response) {
        String email = normalizeEmail(request.email());
        String password = request.password();

        if (!StringUtils.hasText(email) || !StringUtils.hasText(password)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email and password are required");
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !Boolean.TRUE.equals(user.getIsActive())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        if (!StringUtils.hasText(user.getPassword())) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Account misconfigured");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        Role role = ensureValidUserRole(user).orElseThrow(() ->
                new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "No roles configured. Run the seed script and try again."));

        user.setRole(role.getId());
        issueNewSession(user, response);

        return Map.of("message", "Login successful");
    }

    public void refresh(HttpServletRequest request, HttpServletResponse response) {
        String token = CookieUtil.getCookieValue(request, "refreshToken")
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized"));

        Claims claims;
        try {
            claims = jwtService.parseRefreshToken(token);
        } catch (RuntimeException ex) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Forbidden");
        }

        String tokenHash = HashUtil.sha256(token);
        RefreshToken storedToken = refreshTokenRepository.findByTokenHashAndRevokedFalse(tokenHash)
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Forbidden"));

        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        String userId = claims.getSubject();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Forbidden"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Forbidden");
        }

        issueNewSession(user, response);
    }

    public void logout(HttpServletRequest request, HttpServletResponse response) {
        CookieUtil.getCookieValue(request, "refreshToken").ifPresent(refreshToken -> {
            String hash = HashUtil.sha256(refreshToken);
            refreshTokenRepository.findByTokenHashAndRevokedFalse(hash).ifPresent(tokenDoc -> {
                tokenDoc.setRevoked(true);
                refreshTokenRepository.save(tokenDoc);
            });
        });

        CookieUtil.clearAuthCookies(response, isProduction());
    }

    public Map<String, Object> me(CurrentUser currentUser) {
        if (currentUser == null || !StringUtils.hasText(currentUser.id())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        User user = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        Role role = ensureValidUserRole(user).orElseThrow(() ->
                new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "No roles configured. Run the seed script and try again."));

        Role hydratedRole = roleRepository.findById(role.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Role not found. Contact administrator."));

        List<String> permissionKeys = permissionRepository.findAllById(hydratedRole.getPermissions())
                .stream()
                .map(Permission::getKey)
                .filter(Objects::nonNull)
                .toList();

        Map<String, Object> userBody = new LinkedHashMap<>();
        userBody.put("id", user.getId());
        userBody.put("email", user.getEmail());
        userBody.put("role", hydratedRole.getName());
        userBody.put("permissions", permissionKeys);

        return Map.of("user", userBody);
    }

    private void issueNewSession(User user, HttpServletResponse response) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        RefreshToken refreshTokenDoc = new RefreshToken();
        refreshTokenDoc.setUserId(user.getId());
        refreshTokenDoc.setTokenHash(HashUtil.sha256(refreshToken));
        refreshTokenDoc.setExpiresAt(Instant.now().plusMillis(jwtService.getRefreshTokenTtlMillis()));
        refreshTokenDoc.setRevoked(false);
        refreshTokenRepository.save(refreshTokenDoc);

        boolean secure = isProduction();
        CookieUtil.addAccessTokenCookie(response, accessToken, jwtService.getAccessTokenTtlMillis(), secure);
        CookieUtil.addRefreshTokenCookie(response, refreshToken, jwtService.getRefreshTokenTtlMillis(), secure);
    }

    private Optional<Role> ensureValidUserRole(User user) {
        if (StringUtils.hasText(user.getRole())) {
            Optional<Role> existingRole = roleRepository.findById(user.getRole());
            if (existingRole.isPresent()) {
                return existingRole;
            }
        }

        Optional<Role> fallbackRole = getFallbackRole();
        fallbackRole.ifPresent(role -> {
            user.setRole(role.getId());
            userRepository.save(user);
        });

        return fallbackRole;
    }

    private Optional<Role> getFallbackRole() {
        Optional<Role> endUserRole = roleRepository.findByName("end-user");
        if (endUserRole.isPresent()) {
            return endUserRole;
        }
        return roleRepository.findFirstByOrderByCreatedAtAsc();
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return "";
        }
        return email.trim().toLowerCase();
    }

    private boolean isProduction() {
        return "production".equalsIgnoreCase(appProperties.getNodeEnv());
    }
}
