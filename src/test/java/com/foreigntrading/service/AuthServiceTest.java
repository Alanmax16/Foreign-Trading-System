package com.foreigntrading.service;

import com.foreigntrading.exception.AuthenticationException;
import com.foreigntrading.model.User;
import com.foreigntrading.repository.UserRepository;
import com.foreigntrading.util.TestHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private Authentication testAuthentication;
    private String testToken;

    @BeforeEach
    void setUp() {
        testUser = TestHelper.createTestRegularUser(passwordEncoder);
        testAuthentication = new UsernamePasswordAuthenticationToken(testUser, null);
        testToken = "test.jwt.token";
    }

    @Test
    void login_WhenCredentialsAreValid_ReturnsToken() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(testAuthentication);
        when(jwtService.generateToken(testUser)).thenReturn(testToken);

        // Act
        String result = authService.login(testUser.getUsername(), "password");

        // Assert
        assertNotNull(result);
        assertEquals(testToken, result);
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtService).generateToken(testUser);
    }

    @Test
    void login_WhenCredentialsAreInvalid_ThrowsException() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new org.springframework.security.core.AuthenticationException("Invalid credentials") {});

        // Act & Assert
        assertThrows(AuthenticationException.class, () -> authService.login(testUser.getUsername(), "wrong_password"));
    }

    @Test
    void register_WhenUserIsValid_CreatesUser() {
        // Arrange
        when(userRepository.findByUsername(testUser.getUsername())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateToken(testUser)).thenReturn(testToken);

        // Act
        String result = authService.register(testUser);

        // Assert
        assertNotNull(result);
        assertEquals(testToken, result);
        verify(userRepository).save(any(User.class));
        verify(passwordEncoder).encode(anyString());
        verify(jwtService).generateToken(testUser);
    }

    @Test
    void register_WhenUsernameExists_ThrowsException() {
        // Arrange
        when(userRepository.findByUsername(testUser.getUsername())).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThrows(AuthenticationException.class, () -> authService.register(testUser));
    }

    @Test
    void register_WhenEmailExists_ThrowsException() {
        // Arrange
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThrows(AuthenticationException.class, () -> authService.register(testUser));
    }

    @Test
    void validateToken_WhenTokenIsValid_ReturnsTrue() {
        // Arrange
        when(jwtService.validateToken(testToken)).thenReturn(true);

        // Act
        boolean result = authService.validateToken(testToken);

        // Assert
        assertTrue(result);
        verify(jwtService).validateToken(testToken);
    }

    @Test
    void validateToken_WhenTokenIsInvalid_ReturnsFalse() {
        // Arrange
        when(jwtService.validateToken(testToken)).thenReturn(false);

        // Act
        boolean result = authService.validateToken(testToken);

        // Assert
        assertFalse(result);
        verify(jwtService).validateToken(testToken);
    }

    @Test
    void getUserFromToken_WhenTokenIsValid_ReturnsUser() {
        // Arrange
        when(jwtService.validateToken(testToken)).thenReturn(true);
        when(jwtService.extractUsername(testToken)).thenReturn(testUser.getUsername());
        when(userRepository.findByUsername(testUser.getUsername())).thenReturn(Optional.of(testUser));

        // Act
        User result = authService.getUserFromToken(testToken);

        // Assert
        assertNotNull(result);
        assertEquals(testUser.getUsername(), result.getUsername());
        assertEquals(testUser.getEmail(), result.getEmail());
    }

    @Test
    void getUserFromToken_WhenTokenIsInvalid_ThrowsException() {
        // Arrange
        when(jwtService.validateToken(testToken)).thenReturn(false);

        // Act & Assert
        assertThrows(AuthenticationException.class, () -> authService.getUserFromToken(testToken));
    }

    @Test
    void getUserFromToken_WhenUserNotFound_ThrowsException() {
        // Arrange
        when(jwtService.validateToken(testToken)).thenReturn(true);
        when(jwtService.extractUsername(testToken)).thenReturn(testUser.getUsername());
        when(userRepository.findByUsername(testUser.getUsername())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(AuthenticationException.class, () -> authService.getUserFromToken(testToken));
    }
} 