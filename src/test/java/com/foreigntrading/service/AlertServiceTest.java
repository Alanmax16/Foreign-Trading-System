package com.foreigntrading.service;

import com.foreigntrading.exception.ResourceNotFoundException;
import com.foreigntrading.model.Alert;
import com.foreigntrading.model.User;
import com.foreigntrading.repository.AlertRepository;
import com.foreigntrading.util.TestHelper;
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
class AlertServiceTest {

    @Mock
    private AlertRepository alertRepository;

    @Mock
    private MarketDataService marketDataService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AlertService alertService;

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
    void createAlert_WhenAlertIsValid_SavesAlert() {
        // Arrange
        when(alertRepository.save(any(Alert.class))).thenReturn(testAlert);

        // Act
        Alert result = alertService.createAlert(testAlert);

        // Assert
        assertNotNull(result);
        assertEquals(testAlert.getCurrencyPair(), result.getCurrencyPair());
        assertEquals(testAlert.getTargetPrice(), result.getTargetPrice());
        assertEquals(testAlert.getCondition(), result.getCondition());
        assertEquals(testAlert.getStatus(), result.getStatus());
        verify(alertRepository).save(any(Alert.class));
    }

    @Test
    void getAlertById_WhenAlertExists_ReturnsAlert() {
        // Arrange
        when(alertRepository.findById(1L)).thenReturn(Optional.of(testAlert));

        // Act
        Alert result = alertService.getAlertById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(testAlert.getCurrencyPair(), result.getCurrencyPair());
        assertEquals(testAlert.getTargetPrice(), result.getTargetPrice());
        assertEquals(testAlert.getCondition(), result.getCondition());
        assertEquals(testAlert.getStatus(), result.getStatus());
    }

    @Test
    void getAlertById_WhenAlertDoesNotExist_ThrowsException() {
        // Arrange
        when(alertRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> alertService.getAlertById(1L));
    }

    @Test
    void updateAlert_WhenAlertExists_UpdatesAlert() {
        // Arrange
        when(alertRepository.findById(1L)).thenReturn(Optional.of(testAlert));
        when(alertRepository.save(any(Alert.class))).thenReturn(testAlert);

        // Act
        Alert result = alertService.updateAlert(1L, testAlert);

        // Assert
        assertNotNull(result);
        assertEquals(testAlert.getCurrencyPair(), result.getCurrencyPair());
        assertEquals(testAlert.getTargetPrice(), result.getTargetPrice());
        assertEquals(testAlert.getCondition(), result.getCondition());
        assertEquals(testAlert.getStatus(), result.getStatus());
        verify(alertRepository).save(any(Alert.class));
    }

    @Test
    void updateAlert_WhenAlertDoesNotExist_ThrowsException() {
        // Arrange
        when(alertRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> alertService.updateAlert(1L, testAlert));
    }

    @Test
    void deleteAlert_WhenAlertExists_DeletesAlert() {
        // Arrange
        when(alertRepository.findById(1L)).thenReturn(Optional.of(testAlert));

        // Act
        alertService.deleteAlert(1L);

        // Assert
        verify(alertRepository).delete(testAlert);
    }

    @Test
    void deleteAlert_WhenAlertDoesNotExist_ThrowsException() {
        // Arrange
        when(alertRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> alertService.deleteAlert(1L));
    }

    @Test
    void getUserAlerts_ReturnsUserAlerts() {
        // Arrange
        List<Alert> alerts = Arrays.asList(testAlert);
        when(alertRepository.findByUserId(1L)).thenReturn(alerts);

        // Act
        List<Alert> result = alertService.getUserAlerts(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testAlert.getCurrencyPair(), result.get(0).getCurrencyPair());
    }

    @Test
    void checkAlerts_WhenConditionMet_UpdatesAlertStatus() {
        // Arrange
        List<Alert> activeAlerts = Arrays.asList(testAlert);
        when(alertRepository.findByStatus(Alert.AlertStatus.ACTIVE)).thenReturn(activeAlerts);
        when(marketDataService.getLatestMarketData("EUR/USD")).thenReturn(createTestMarketData());

        // Act
        alertService.checkAlerts();

        // Assert
        verify(alertRepository).save(any(Alert.class));
        assertEquals(Alert.AlertStatus.TRIGGERED, testAlert.getStatus());
    }

    @Test
    void checkAlerts_WhenConditionNotMet_DoesNotUpdateAlert() {
        // Arrange
        List<Alert> activeAlerts = Arrays.asList(testAlert);
        when(alertRepository.findByStatus(Alert.AlertStatus.ACTIVE)).thenReturn(activeAlerts);
        when(marketDataService.getLatestMarketData("EUR/USD")).thenReturn(createTestMarketData());

        // Act
        alertService.checkAlerts();

        // Assert
        verify(alertRepository, never()).save(any(Alert.class));
        assertEquals(Alert.AlertStatus.ACTIVE, testAlert.getStatus());
    }

    private com.foreigntrading.model.MarketData createTestMarketData() {
        com.foreigntrading.model.MarketData marketData = new com.foreigntrading.model.MarketData();
        marketData.setCurrencyPair("EUR/USD");
        marketData.setBidPrice(1.1234);
        marketData.setAskPrice(1.1235);
        marketData.setTimestamp(LocalDateTime.now());
        return marketData;
    }
} 