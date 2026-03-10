package com.example.jwtcookies.security;

import com.example.jwtcookies.util.HttpResponseUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final long WINDOW_MS = 15 * 60 * 1000L;
    private static final int MAX_REQUESTS = 100;

    private final ConcurrentHashMap<String, WindowCounter> counters = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/auth");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String key = resolveClientKey(request);
        long now = System.currentTimeMillis();

        WindowCounter updated = counters.compute(key, (k, existing) -> {
            if (existing == null || now - existing.windowStartMs() >= WINDOW_MS) {
                return new WindowCounter(now, 1);
            }
            return new WindowCounter(existing.windowStartMs(), existing.count() + 1);
        });

        if (updated != null && updated.count() > MAX_REQUESTS) {
            HttpResponseUtil.writeJson(response, 429, Map.of("message", "Too many requests"));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String resolveClientKey(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwardedFor)) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record WindowCounter(long windowStartMs, int count) {
    }
}
