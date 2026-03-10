package com.example.jwtcookies.security;

import java.util.List;

public record CurrentUser(String id, String email, String roleId, List<String> permissions) {
}
