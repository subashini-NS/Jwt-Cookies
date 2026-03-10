package com.example.jwtcookies.repository;

import com.example.jwtcookies.model.Role;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface RoleRepository extends MongoRepository<Role, String> {
    Optional<Role> findByName(String name);
    Optional<Role> findFirstByOrderByCreatedAtAsc();
}
