package com.foreigntrading.service;

import com.foreigntrading.model.User;
import com.foreigntrading.util.TestHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private JwtService jwtService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = TestHelper.createTestRegularUser(passwordEncoder);
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "test-secret-key-123");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 3600000L); // 1 hour
    }

    @Test
    void generateToken_WhenUserIsValid_ReturnsToken() {
        // Act
        String token = jwtService.generateToken(testUser);

        // Assert
        assertNotNull(token);
        assertTrue(token.length() > 0);
    }

    @Test
    void validateToken_WhenTokenIsValid_ReturnsTrue() {
        // Arrange
        String token = jwtService.generateToken(testUser);

        // Act
        boolean isValid = jwtService.validateToken(token);

        // Assert
        assertTrue(isValid);
    }

    @Test
    void validateToken_WhenTokenIsInvalid_ReturnsFalse() {
        // Arrange
        String invalidToken = "invalid.token.string";

        // Act
        boolean isValid = jwtService.validateToken(invalidToken);

        // Assert
        assertFalse(isValid);
    }

    @Test
    void extractUsername_WhenTokenIsValid_ReturnsUsername() {
        // Arrange
        String token = jwtService.generateToken(testUser);

        // Act
        String username = jwtService.extractUsername(token);

        // Assert
        assertEquals(testUser.getUsername(), username);
    }

    @Test
    void extractExpiration_WhenTokenIsValid_ReturnsExpirationDate() {
        // Arrange
        String token = jwtService.generateToken(testUser);

        // Act
        Date expiration = jwtService.extractExpiration(token);

        // Assert
        assertNotNull(expiration);
        assertTrue(expiration.after(new Date()));
    }

    @Test
    void isTokenExpired_WhenTokenIsValid_ReturnsFalse() {
        // Arrange
        String token = jwtService.generateToken(testUser);

        // Act
        boolean isExpired = jwtService.isTokenExpired(token);

        // Assert
        assertFalse(isExpired);
    }

    @Test
    void generateToken_WithCustomExpiration_ReturnsToken() {
        // Arrange
        long customExpiration = 7200000L; // 2 hours

        // Act
        String token = jwtService.generateToken(testUser, customExpiration);

        // Assert
        assertNotNull(token);
        assertTrue(token.length() > 0);
    }

    @Test
    void generateToken_WithNullUser_ThrowsException() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> jwtService.generateToken(null));
    }

    @Test
    void validateToken_WithNullToken_ReturnsFalse() {
        // Act
        boolean isValid = jwtService.validateToken(null);

        // Assert
        assertFalse(isValid);
    }

    @Test
    void extractUsername_WithNullToken_ReturnsNull() {
        // Act
        String username = jwtService.extractUsername(null);

        // Assert
        assertNull(username);
    }

    @Test
    void extractExpiration_WithNullToken_ReturnsNull() {
        // Act
        Date expiration = jwtService.extractExpiration(null);

        // Assert
        assertNull(expiration);
    }
} 