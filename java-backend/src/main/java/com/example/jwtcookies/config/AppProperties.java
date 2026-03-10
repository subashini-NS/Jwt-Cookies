package com.example.jwtcookies.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private String clientUrl;
    private String nodeEnv = "development";
    private final Jwt jwt = new Jwt();

    public String getClientUrl() {
        return clientUrl;
    }

    public void setClientUrl(String clientUrl) {
        this.clientUrl = clientUrl;
    }

    public String getNodeEnv() {
        return nodeEnv;
    }

    public void setNodeEnv(String nodeEnv) {
        this.nodeEnv = nodeEnv;
    }

    public Jwt getJwt() {
        return jwt;
    }

    public static class Jwt {
        private String accessSecret;
        private String refreshSecret;
        private String accessExpiry = "15m";
        private String refreshExpiry = "30d";

        public String getAccessSecret() {
            return accessSecret;
        }

        public void setAccessSecret(String accessSecret) {
            this.accessSecret = accessSecret;
        }

        public String getRefreshSecret() {
            return refreshSecret;
        }

        public void setRefreshSecret(String refreshSecret) {
            this.refreshSecret = refreshSecret;
        }

        public String getAccessExpiry() {
            return accessExpiry;
        }

        public void setAccessExpiry(String accessExpiry) {
            this.accessExpiry = accessExpiry;
        }

        public String getRefreshExpiry() {
            return refreshExpiry;
        }

        public void setRefreshExpiry(String refreshExpiry) {
            this.refreshExpiry = refreshExpiry;
        }
    }
}
