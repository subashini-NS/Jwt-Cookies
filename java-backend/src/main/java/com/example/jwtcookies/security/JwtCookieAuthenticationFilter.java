package com.example.jwtcookies.security;

import com.example.jwtcookies.model.Permission;
import com.example.jwtcookies.model.Role;
import com.example.jwtcookies.model.User;
import com.example.jwtcookies.repository.PermissionRepository;
import com.example.jwtcookies.repository.RoleRepository;
import com.example.jwtcookies.repository.UserRepository;
import com.example.jwtcookies.util.CookieUtil;
import com.example.jwtcookies.util.HttpResponseUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
public class JwtCookieAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    public JwtCookieAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository,
            RoleRepository roleRepository,
            PermissionRepository permissionRepository
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        Optional<String> accessToken = CookieUtil.getCookieValue(request, "accessToken");
        if (accessToken.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        Claims claims;
        try {
            claims = jwtService.parseAccessToken(accessToken.get());
        } catch (RuntimeException ex) {
            HttpResponseUtil.writeMessage(response, 401, "Invalid token");
            return;
        }

        String userId = claims.getSubject();
        if (!StringUtils.hasText(userId)) {
            HttpResponseUtil.writeMessage(response, 401, "Invalid token");
            return;
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty() || !Boolean.TRUE.equals(userOpt.get().getIsActive())) {
            HttpResponseUtil.writeMessage(response, 401, "Unauthorized");
            return;
        }

        User user = userOpt.get();
        List<String> permissionKeys = resolvePermissionKeys(user.getRole());
        List<GrantedAuthority> authorities = new ArrayList<>();
        for (String key : permissionKeys) {
            authorities.add(new SimpleGrantedAuthority(key));
        }

        CurrentUser currentUser = new CurrentUser(user.getId(), user.getEmail(), user.getRole(), permissionKeys);
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(currentUser, null, authorities);

        SecurityContextHolder.getContext().setAuthentication(authentication);
        filterChain.doFilter(request, response);
    }

    private List<String> resolvePermissionKeys(String roleId) {
        if (!StringUtils.hasText(roleId)) {
            return Collections.emptyList();
        }

        Optional<Role> roleOpt = roleRepository.findById(roleId);
        if (roleOpt.isEmpty() || roleOpt.get().getPermissions() == null || roleOpt.get().getPermissions().isEmpty()) {
            return Collections.emptyList();
        }

        return permissionRepository.findAllById(roleOpt.get().getPermissions())
                .stream()
                .map(Permission::getKey)
                .filter(StringUtils::hasText)
                .toList();
    }
}
