package com.foreigntrading.service;

import com.foreigntrading.exception.PaymentProcessingException;
import com.foreigntrading.exception.ResourceNotFoundException;
import com.foreigntrading.model.Payment;
import com.foreigntrading.model.User;
import com.foreigntrading.model.Account;
import com.foreigntrading.repository.PaymentRepository;
import com.foreigntrading.repository.AccountRepository;
import com.foreigntrading.util.TestHelper;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import com.stripe.param.ChargeCreateParams;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private StripeService stripeService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PaymentService paymentService;

    private User testUser;
    private Account testAccount;
    private Payment testPayment;
    private Charge testCharge;

    @BeforeEach
    void setUp() {
        testUser = TestHelper.createTestRegularUser(passwordEncoder);
        
        testAccount = new Account();
        testAccount.setId(1L);
        testAccount.setUser(testUser);
        testAccount.setBalance(new BigDecimal("10000.00"));
        testAccount.setCurrency("USD");

        testPayment = new Payment();
        testPayment.setId(1L);
        testPayment.setUser(testUser);
        testPayment.setAccount(testAccount);
        testPayment.setAmount(new BigDecimal("1000.00"));
        testPayment.setCurrency("USD");
        testPayment.setStatus(Payment.PaymentStatus.PENDING);
        testPayment.setTimestamp(LocalDateTime.now());

        testCharge = new Charge();
        testCharge.setId("ch_test_123");
        testCharge.setAmount(100000L); // $1000.00 in cents
        testCharge.setCurrency("usd");
        testCharge.setStatus("succeeded");
    }

    @Test
    void processPayment_WhenValidPayment_SavesPayment() throws StripeException {
        // Arrange
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));
        when(stripeService.createCharge(any(ChargeCreateParams.class))).thenReturn(testCharge);
        when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);

        // Act
        Payment result = paymentService.processPayment(1L, testPayment);

        // Assert
        assertNotNull(result);
        assertEquals(testPayment.getAmount(), result.getAmount());
        assertEquals(testPayment.getCurrency(), result.getCurrency());
        assertEquals(Payment.PaymentStatus.COMPLETED, result.getStatus());
        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    void processPayment_WhenAccountNotFound_ThrowsException() {
        // Arrange
        when(accountRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> paymentService.processPayment(1L, testPayment));
    }

    @Test
    void processPayment_WhenStripeError_ThrowsException() throws StripeException {
        // Arrange
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));
        when(stripeService.createCharge(any(ChargeCreateParams.class))).thenThrow(new StripeException("Stripe error", null, null));

        // Act & Assert
        assertThrows(PaymentProcessingException.class, () -> paymentService.processPayment(1L, testPayment));
    }

    @Test
    void getPaymentById_WhenPaymentExists_ReturnsPayment() {
        // Arrange
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(testPayment));

        // Act
        Payment result = paymentService.getPaymentById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(testPayment.getAmount(), result.getAmount());
        assertEquals(testPayment.getCurrency(), result.getCurrency());
        assertEquals(testPayment.getStatus(), result.getStatus());
    }

    @Test
    void getPaymentById_WhenPaymentDoesNotExist_ThrowsException() {
        // Arrange
        when(paymentRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> paymentService.getPaymentById(1L));
    }

    @Test
    void getUserPayments_ReturnsUserPayments() {
        // Arrange
        List<Payment> payments = Arrays.asList(testPayment);
        when(paymentRepository.findByUserId(1L)).thenReturn(payments);

        // Act
        List<Payment> result = paymentService.getUserPayments(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testPayment.getAmount(), result.get(0).getAmount());
    }

    @Test
    void handleStripeWebhook_WhenValidEvent_UpdatesPayment() {
        // Arrange
        String webhookPayload = "{\"type\":\"charge.succeeded\",\"data\":{\"object\":{\"id\":\"ch_test_123\",\"amount\":100000,\"currency\":\"usd\",\"status\":\"succeeded\"}}}";
        when(paymentRepository.findByStripeChargeId("ch_test_123")).thenReturn(Optional.of(testPayment));
        when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);

        // Act
        paymentService.handleStripeWebhook(webhookPayload);

        // Assert
        verify(paymentRepository).save(any(Payment.class));
        assertEquals(Payment.PaymentStatus.COMPLETED, testPayment.getStatus());
    }

    @Test
    void handleStripeWebhook_WhenPaymentNotFound_DoesNotUpdate() {
        // Arrange
        String webhookPayload = "{\"type\":\"charge.succeeded\",\"data\":{\"object\":{\"id\":\"ch_test_123\",\"amount\":100000,\"currency\":\"usd\",\"status\":\"succeeded\"}}}";
        when(paymentRepository.findByStripeChargeId("ch_test_123")).thenReturn(Optional.empty());

        // Act
        paymentService.handleStripeWebhook(webhookPayload);

        // Assert
        verify(paymentRepository, never()).save(any(Payment.class));
    }
} 