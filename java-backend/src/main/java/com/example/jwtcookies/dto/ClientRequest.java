package com.example.jwtcookies.dto;

import com.example.jwtcookies.model.ClientAddress;

public record ClientRequest(
        String name,
        String email,
        String phone,
        ClientAddress address,
        String status
) {
}
