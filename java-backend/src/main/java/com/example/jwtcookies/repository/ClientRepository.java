package com.example.jwtcookies.repository;

import com.example.jwtcookies.model.Client;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ClientRepository extends MongoRepository<Client, String> {
}
