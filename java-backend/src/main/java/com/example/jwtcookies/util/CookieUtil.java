package com.example.jwtcookies.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;

public final class CookieUtil {

    private CookieUtil() {
    }

    public static Optional<String> getCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null || cookies.length == 0) {
            return Optional.empty();
        }

        return Arrays.stream(cookies)
                .filter(cookie -> name.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }

    public static void addAccessTokenCookie(HttpServletResponse response, String token, long maxAgeMillis, boolean secure) {
        addCookie(response, "accessToken", token, maxAgeMillis, secure);
    }

    public static void addRefreshTokenCookie(HttpServletResponse response, String token, long maxAgeMillis, boolean secure) {
        addCookie(response, "refreshToken", token, maxAgeMillis, secure);
    }

    public static void clearAuthCookies(HttpServletResponse response, boolean secure) {
        addCookie(response, "accessToken", "", 0, secure);
        addCookie(response, "refreshToken", "", 0, secure);
    }

    private static void addCookie(HttpServletResponse response, String name, String value, long maxAgeMillis, boolean secure) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .sameSite("Lax")
                .secure(secure)
                .path("/")
                .maxAge(Duration.ofMillis(Math.max(maxAgeMillis, 0)))
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
