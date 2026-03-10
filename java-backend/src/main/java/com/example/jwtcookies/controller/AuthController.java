package com.example.jwtcookies.controller;

import com.example.jwtcookies.dto.AuthRequest;
import com.example.jwtcookies.security.CurrentUser;
import com.example.jwtcookies.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request, HttpServletResponse response) {
        List<Map<String, String>> errors = validateRegister(request);
        if (!errors.isEmpty()) {
            return ResponseEntity.unprocessableEntity().body(Map.of("errors", errors));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request, response));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AuthRequest request, HttpServletResponse response) {
        return ResponseEntity.ok(authService.login(request, response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<Void> refresh(HttpServletRequest request, HttpServletResponse response) {
        authService.refresh(request, response);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(request, response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal CurrentUser currentUser) {
        return ResponseEntity.ok(authService.me(currentUser));
    }

    private List<Map<String, String>> validateRegister(AuthRequest request) {
        List<Map<String, String>> errors = new ArrayList<>();

        String email = request.email() == null ? "" : request.email().trim();
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            errors.add(buildError("email", "Valid email is required"));
        }

        if (!StringUtils.hasText(request.password()) || request.password().length() < 8) {
            errors.add(buildError("password", "Password must be at least 8 characters"));
        }

        return errors;
    }

    private Map<String, String> buildError(String path, String message) {
        Map<String, String> error = new LinkedHashMap<>();
        error.put("path", path);
        error.put("msg", message);
        return error;
    }
}
