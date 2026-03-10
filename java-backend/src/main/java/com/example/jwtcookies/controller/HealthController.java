package com.example.jwtcookies.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        double uptimeSeconds = ManagementFactory.getRuntimeMXBean().getUptime() / 1000.0;

        return Map.of(
                "status", "UP",
                "uptime", uptimeSeconds,
                "timestamp", Instant.now().toString()
        );
    }
}
