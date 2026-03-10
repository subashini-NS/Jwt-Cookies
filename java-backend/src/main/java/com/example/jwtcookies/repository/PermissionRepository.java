package com.example.jwtcookies.repository;

import com.example.jwtcookies.model.Permission;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PermissionRepository extends MongoRepository<Permission, String> {
    Optional<Permission> findByKey(String key);
}
