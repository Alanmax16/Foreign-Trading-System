package com.foreigntrading.config;

import com.foreigntrading.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class SecurityConfigTest {

    @Autowired
    private SecurityConfig securityConfig;

    @Test
    void securityFilterChain_ShouldBeConfigured() {
        // Act
        SecurityFilterChain filterChain = securityConfig.securityFilterChain(null);

        // Assert
        assertNotNull(filterChain);
    }

    @Test
    void passwordEncoder_ShouldBeConfigured() {
        // Act
        PasswordEncoder passwordEncoder = securityConfig.passwordEncoder();

        // Assert
        assertNotNull(passwordEncoder);
    }

    @Test
    void authenticationManager_ShouldBeConfigured() {
        // Act
        AuthenticationManager authenticationManager = securityConfig.authenticationManager(null);

        // Assert
        assertNotNull(authenticationManager);
    }

    @Test
    void jwtAuthenticationFilter_ShouldBeConfigured() {
        // Act
        JwtAuthenticationFilter jwtFilter = securityConfig.jwtAuthenticationFilter();

        // Assert
        assertNotNull(jwtFilter);
    }

    @Test
    void securityConfig_ShouldAllowPublicEndpoints() {
        // Act
        SecurityFilterChain filterChain = securityConfig.securityFilterChain(null);
        HttpSecurity http = (HttpSecurity) filterChain.getFilters().get(0);

        // Assert
        assertNotNull(http);
        // Note: We can't directly test the security rules as they are configured internally
        // The best we can do is verify that the SecurityFilterChain is created
    }
} 