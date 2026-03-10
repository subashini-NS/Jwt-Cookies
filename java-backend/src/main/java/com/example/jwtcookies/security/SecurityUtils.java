package com.example.jwtcookies.security;

import com.example.jwtcookies.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static CurrentUser currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CurrentUser currentUser)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return currentUser;
    }

    public static String currentUserId() {
        return currentUser().id();
    }
}
