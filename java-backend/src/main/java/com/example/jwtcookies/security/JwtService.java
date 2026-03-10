package com.example.jwtcookies.security;

import com.example.jwtcookies.config.AppProperties;
import com.example.jwtcookies.model.User;
import com.example.jwtcookies.util.DurationParser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final AppProperties appProperties;

    public JwtService(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public String generateAccessToken(User user) {
        return generateToken(user, appProperties.getJwt().getAccessSecret(), getAccessTokenTtlMillis());
    }

    public String generateRefreshToken(User user) {
        return generateToken(user, appProperties.getJwt().getRefreshSecret(), getRefreshTokenTtlMillis());
    }

    public Claims parseAccessToken(String token) {
        return parseToken(token, appProperties.getJwt().getAccessSecret());
    }

    public Claims parseRefreshToken(String token) {
        return parseToken(token, appProperties.getJwt().getRefreshSecret());
    }

    public long getAccessTokenTtlMillis() {
        return DurationParser.parseToMillis(appProperties.getJwt().getAccessExpiry());
    }

    public long getRefreshTokenTtlMillis() {
        return DurationParser.parseToMillis(appProperties.getJwt().getRefreshExpiry());
    }

    private String generateToken(User user, String secret, long ttlMillis) {
        Instant now = Instant.now();

        return Jwts.builder()
                .subject(user.getId())
                .claim("email", user.getEmail())
                .claim("role", user.getRole())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(ttlMillis)))
                .signWith(signingKey(secret), Jwts.SIG.HS256)
                .compact();
    }

    private Claims parseToken(String token, String secret) {
        try {
            return Jwts.parser()
                    .verifyWith(signingKey(secret))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException ex) {
            throw new RuntimeException("Invalid token", ex);
        }
    }

    private SecretKey signingKey(String secret) {
        return new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }
}
