package com.foreigntrading.service;

import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import com.stripe.param.ChargeCreateParams;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StripeServiceTest {

    @Mock
    private Charge charge;

    @InjectMocks
    private StripeService stripeService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(stripeService, "stripeSecretKey", "sk_test_1234567890");
    }

    @Test
    void createCharge_WhenValidParams_ReturnsCharge() throws StripeException {
        // Arrange
        ChargeCreateParams params = ChargeCreateParams.builder()
            .setAmount(100000L) // $1000.00 in cents
            .setCurrency("usd")
            .setSource("tok_visa")
            .build();

        when(charge.getId()).thenReturn("ch_test_123");
        when(charge.getAmount()).thenReturn(100000L);
        when(charge.getCurrency()).thenReturn("usd");
        when(charge.getStatus()).thenReturn("succeeded");

        // Act
        Charge result = stripeService.createCharge(params);

        // Assert
        assertNotNull(result);
        assertEquals("ch_test_123", result.getId());
        assertEquals(100000L, result.getAmount());
        assertEquals("usd", result.getCurrency());
        assertEquals("succeeded", result.getStatus());
    }

    @Test
    void createCharge_WhenInvalidParams_ThrowsException() {
        // Arrange
        ChargeCreateParams params = ChargeCreateParams.builder()
            .setAmount(-1000L)
            .setCurrency("usd")
            .setSource("tok_visa")
            .build();

        // Act & Assert
        assertThrows(StripeException.class, () -> stripeService.createCharge(params));
    }

    @Test
    void createCharge_WhenStripeError_ThrowsException() throws StripeException {
        // Arrange
        ChargeCreateParams params = ChargeCreateParams.builder()
            .setAmount(100000L)
            .setCurrency("usd")
            .setSource("tok_visa")
            .build();

        when(charge.getId()).thenThrow(new StripeException("Stripe error", null, null));

        // Act & Assert
        assertThrows(StripeException.class, () -> stripeService.createCharge(params));
    }

    @Test
    void convertToStripeAmount_WhenValidAmount_ReturnsCorrectValue() {
        // Arrange
        BigDecimal amount = new BigDecimal("1000.00");

        // Act
        Long result = stripeService.convertToStripeAmount(amount);

        // Assert
        assertEquals(100000L, result);
    }

    @Test
    void convertToStripeAmount_WhenZeroAmount_ReturnsZero() {
        // Arrange
        BigDecimal amount = BigDecimal.ZERO;

        // Act
        Long result = stripeService.convertToStripeAmount(amount);

        // Assert
        assertEquals(0L, result);
    }

    @Test
    void convertToStripeAmount_WhenNegativeAmount_ThrowsException() {
        // Arrange
        BigDecimal amount = new BigDecimal("-1000.00");

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> stripeService.convertToStripeAmount(amount));
    }

    @Test
    void convertFromStripeAmount_WhenValidAmount_ReturnsCorrectValue() {
        // Arrange
        Long amount = 100000L;

        // Act
        BigDecimal result = stripeService.convertFromStripeAmount(amount);

        // Assert
        assertEquals(new BigDecimal("1000.00"), result);
    }

    @Test
    void convertFromStripeAmount_WhenZeroAmount_ReturnsZero() {
        // Arrange
        Long amount = 0L;

        // Act
        BigDecimal result = stripeService.convertFromStripeAmount(amount);

        // Assert
        assertEquals(BigDecimal.ZERO, result);
    }

    @Test
    void validateStripeWebhook_WhenValidSignature_ReturnsTrue() {
        // Arrange
        String payload = "{\"type\":\"charge.succeeded\",\"data\":{\"object\":{\"id\":\"ch_test_123\"}}}";
        String signature = "t=1234567890,v1=valid_signature";

        // Act
        boolean result = stripeService.validateStripeWebhook(payload, signature);

        // Assert
        assertTrue(result);
    }

    @Test
    void validateStripeWebhook_WhenInvalidSignature_ReturnsFalse() {
        // Arrange
        String payload = "{\"type\":\"charge.succeeded\",\"data\":{\"object\":{\"id\":\"ch_test_123\"}}}";
        String signature = "t=1234567890,v1=invalid_signature";

        // Act
        boolean result = stripeService.validateStripeWebhook(payload, signature);

        // Assert
        assertFalse(result);
    }
} 