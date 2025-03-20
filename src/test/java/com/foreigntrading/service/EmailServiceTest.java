package com.foreigntrading.service;

import com.foreigntrading.model.Alert;
import com.foreigntrading.model.User;
import com.foreigntrading.util.TestHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private EmailService emailService;

    private User testUser;
    private Alert testAlert;

    @BeforeEach
    void setUp() {
        testUser = TestHelper.createTestRegularUser(passwordEncoder);
        
        testAlert = new Alert();
        testAlert.setId(1L);
        testAlert.setUser(testUser);
        testAlert.setCurrencyPair("EUR/USD");
        testAlert.setTargetPrice(new BigDecimal("1.1234"));
        testAlert.setCondition(Alert.AlertCondition.ABOVE);
        testAlert.setStatus(Alert.AlertStatus.ACTIVE);
        testAlert.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void sendWelcomeEmail_WhenUserIsValid_SendsEmail() {
        // Act
        emailService.sendWelcomeEmail(testUser);

        // Assert
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendAlertEmail_WhenAlertIsValid_SendsEmail() {
        // Act
        emailService.sendAlertEmail(testAlert);

        // Assert
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendTradeConfirmationEmail_WhenTradeIsValid_SendsEmail() {
        // Act
        emailService.sendTradeConfirmationEmail(testUser, "EUR/USD", new BigDecimal("1000.00"), new BigDecimal("1.1234"));

        // Assert
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendPaymentConfirmationEmail_WhenPaymentIsValid_SendsEmail() {
        // Act
        emailService.sendPaymentConfirmationEmail(testUser, new BigDecimal("1000.00"), "USD");

        // Assert
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendPasswordResetEmail_WhenUserIsValid_SendsEmail() {
        // Act
        emailService.sendPasswordResetEmail(testUser, "reset-token");

        // Assert
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendAccountUpdateEmail_WhenUserIsValid_SendsEmail() {
        // Act
        emailService.sendAccountUpdateEmail(testUser);

        // Assert
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendErrorNotificationEmail_WhenErrorOccurs_SendsEmail() {
        // Act
        emailService.sendErrorNotificationEmail("Test error message");

        // Assert
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendMarketDataUpdateEmail_WhenDataIsValid_SendsEmail() {
        // Act
        emailService.sendMarketDataUpdateEmail(testUser, "EUR/USD", new BigDecimal("1.1234"));

        // Assert
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendAccountBalanceUpdateEmail_WhenBalanceIsValid_SendsEmail() {
        // Act
        emailService.sendAccountBalanceUpdateEmail(testUser, new BigDecimal("10000.00"), "USD");

        // Assert
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendSecurityAlertEmail_WhenAlertIsValid_SendsEmail() {
        // Act
        emailService.sendSecurityAlertEmail(testUser, "Suspicious activity detected");

        // Assert
        verify(mailSender).send(any(SimpleMailMessage.class));
    }
} 