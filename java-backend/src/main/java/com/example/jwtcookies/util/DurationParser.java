package com.example.jwtcookies.util;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class DurationParser {

    private static final Pattern DURATION_PATTERN = Pattern.compile("^(\\d+)(ms|s|m|h|d)?$", Pattern.CASE_INSENSITIVE);

    private DurationParser() {
    }

    public static long parseToMillis(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Duration cannot be blank");
        }

        String value = raw.trim().toLowerCase(Locale.ROOT);
        Matcher matcher = DURATION_PATTERN.matcher(value);
        if (!matcher.matches()) {
            throw new IllegalArgumentException("Invalid duration format: " + raw);
        }

        long amount = Long.parseLong(matcher.group(1));
        String unit = matcher.group(2);

        if (unit == null) {
            return amount * 1000L;
        }

        return switch (unit) {
            case "ms" -> amount;
            case "s" -> amount * 1000L;
            case "m" -> amount * 60_000L;
            case "h" -> amount * 3_600_000L;
            case "d" -> amount * 86_400_000L;
            default -> throw new IllegalArgumentException("Unsupported duration unit: " + unit);
        };
    }
}
