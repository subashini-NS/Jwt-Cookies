package com.example.jwtcookies.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.util.Map;

public final class HttpResponseUtil {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private HttpResponseUtil() {
    }

    public static void writeMessage(HttpServletResponse response, int status, String message) throws IOException {
        writeJson(response, status, Map.of("message", message));
    }

    public static void writeJson(HttpServletResponse response, int status, Map<String, ?> body) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        OBJECT_MAPPER.writeValue(response.getWriter(), body);
    }
}
