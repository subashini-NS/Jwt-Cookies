package com.example.jwtcookies.dto;

public record ProductRequest(
        String productName,
        Double price,
        Integer quantity,
        String imageUrl
) {
}
