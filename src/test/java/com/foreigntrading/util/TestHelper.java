package com.foreigntrading.util;

import com.foreigntrading.model.User;
import com.foreigntrading.model.Role;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;

public class TestHelper {

    public static User createTestUser(String username, String email, String password, Role role, PasswordEncoder passwordEncoder) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        
        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);
        
        return user;
    }

    public static User createTestAdminUser(PasswordEncoder passwordEncoder) {
        return createTestUser(
            "admin",
            "admin@example.com",
            "admin123",
            Role.ADMIN,
            passwordEncoder
        );
    }

    public static User createTestRegularUser(PasswordEncoder passwordEncoder) {
        return createTestUser(
            "user",
            "user@example.com",
            "user123",
            Role.USER,
            passwordEncoder
        );
    }

    public static String generateTestJwtToken(String secret, long expiration) {
        // This is a simplified version. In a real application, you would use your JWT service
        return "test.jwt.token";
    }
} 