package com.example.jwtcookies.repository;

import com.example.jwtcookies.model.RefreshToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {
    Optional<RefreshToken> findByTokenHashAndRevokedFalse(String tokenHash);
}
