package com.foreigntrading.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CurrencyApiServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private CurrencyApiService currencyApiService;

    private Map<String, Double> exchangeRates;
    private Map<String, Long> lastUpdateTimes;

    @BeforeEach
    void setUp() {
        exchangeRates = new ConcurrentHashMap<>();
        lastUpdateTimes = new ConcurrentHashMap<>();
        currencyApiService.setExchangeRates(exchangeRates);
        currencyApiService.setLastUpdateTimes(lastUpdateTimes);
    }

    @Test
    void getExchangeRate_WhenRateExists_ReturnsRate() {
        // Arrange
        String currencyPair = "EUR/USD";
        double expectedRate = 1.1234;
        exchangeRates.put(currencyPair, expectedRate);
        lastUpdateTimes.put(currencyPair, System.currentTimeMillis());

        // Act
        Double actualRate = currencyApiService.getExchangeRate(currencyPair);

        // Assert
        assertNotNull(actualRate);
        assertEquals(expectedRate, actualRate);
    }

    @Test
    void getExchangeRate_WhenRateIsStale_ReturnsNull() {
        // Arrange
        String currencyPair = "EUR/USD";
        exchangeRates.put(currencyPair, 1.1234);
        lastUpdateTimes.put(currencyPair, System.currentTimeMillis() - 2 * 60 * 1000); // 2 minutes old

        // Act
        Double actualRate = currencyApiService.getExchangeRate(currencyPair);

        // Assert
        assertNull(actualRate);
    }

    @Test
    void updateExchangeRates_WhenApiCallSucceeds_UpdatesRates() {
        // Arrange
        String currencyPair = "EUR/USD";
        String apiResponse = "{\"Realtime Currency Exchange Rate\": {\"5. Exchange Rate\": \"1.1234\"}}";
        when(restTemplate.getForObject(anyString(), String.class)).thenReturn(apiResponse);

        // Act
        currencyApiService.updateExchangeRates();

        // Assert
        assertTrue(exchangeRates.containsKey(currencyPair));
        assertEquals(1.1234, exchangeRates.get(currencyPair));
        assertTrue(lastUpdateTimes.containsKey(currencyPair));
    }

    @Test
    void updateExchangeRates_WhenApiCallFails_LogsError() {
        // Arrange
        when(restTemplate.getForObject(anyString(), String.class)).thenThrow(new RuntimeException("API Error"));

        // Act
        currencyApiService.updateExchangeRates();

        // Assert
        assertTrue(exchangeRates.isEmpty());
        assertTrue(lastUpdateTimes.isEmpty());
    }

    @Test
    void getAllExchangeRates_ReturnsAllRates() {
        // Arrange
        exchangeRates.put("EUR/USD", 1.1234);
        exchangeRates.put("GBP/USD", 1.3456);
        lastUpdateTimes.put("EUR/USD", System.currentTimeMillis());
        lastUpdateTimes.put("GBP/USD", System.currentTimeMillis());

        // Act
        Map<String, Double> allRates = currencyApiService.getAllExchangeRates();

        // Assert
        assertEquals(2, allRates.size());
        assertTrue(allRates.containsKey("EUR/USD"));
        assertTrue(allRates.containsKey("GBP/USD"));
    }
} 