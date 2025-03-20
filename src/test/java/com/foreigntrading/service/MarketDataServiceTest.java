package com.foreigntrading.service;

import com.foreigntrading.model.MarketData;
import com.foreigntrading.repository.MarketDataRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MarketDataServiceTest {

    @Mock
    private MarketDataRepository marketDataRepository;

    @Mock
    private CurrencyApiService currencyApiService;

    @InjectMocks
    private MarketDataService marketDataService;

    private MarketData testMarketData;

    @BeforeEach
    void setUp() {
        testMarketData = new MarketData();
        testMarketData.setId(1L);
        testMarketData.setCurrencyPair("EUR/USD");
        testMarketData.setBidPrice(1.1234);
        testMarketData.setAskPrice(1.1235);
        testMarketData.setTimestamp(LocalDateTime.now());
    }

    @Test
    void getLatestMarketData_WhenDataExists_ReturnsData() {
        // Arrange
        when(marketDataRepository.findTopByCurrencyPairOrderByTimestampDesc("EUR/USD"))
            .thenReturn(Optional.of(testMarketData));

        // Act
        MarketData result = marketDataService.getLatestMarketData("EUR/USD");

        // Assert
        assertNotNull(result);
        assertEquals(testMarketData.getCurrencyPair(), result.getCurrencyPair());
        assertEquals(testMarketData.getBidPrice(), result.getBidPrice());
        assertEquals(testMarketData.getAskPrice(), result.getAskPrice());
    }

    @Test
    void getLatestMarketData_WhenNoDataExists_ReturnsNull() {
        // Arrange
        when(marketDataRepository.findTopByCurrencyPairOrderByTimestampDesc("EUR/USD"))
            .thenReturn(Optional.empty());

        // Act
        MarketData result = marketDataService.getLatestMarketData("EUR/USD");

        // Assert
        assertNull(result);
    }

    @Test
    void updateMarketData_WhenDataIsValid_SavesData() {
        // Arrange
        when(currencyApiService.getExchangeRate("EUR/USD")).thenReturn(1.1234);
        when(marketDataRepository.save(any(MarketData.class))).thenReturn(testMarketData);

        // Act
        MarketData result = marketDataService.updateMarketData("EUR/USD");

        // Assert
        assertNotNull(result);
        verify(marketDataRepository).save(any(MarketData.class));
    }

    @Test
    void getHistoricalData_WhenDataExists_ReturnsData() {
        // Arrange
        List<MarketData> historicalData = Arrays.asList(testMarketData);
        when(marketDataRepository.findByCurrencyPairAndTimestampBetween(
            anyString(), any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(historicalData);

        // Act
        List<MarketData> result = marketDataService.getHistoricalData(
            "EUR/USD", LocalDateTime.now().minusHours(1), LocalDateTime.now());

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testMarketData.getCurrencyPair(), result.get(0).getCurrencyPair());
    }

    @Test
    void getHistoricalData_WhenNoDataExists_ReturnsEmptyList() {
        // Arrange
        when(marketDataRepository.findByCurrencyPairAndTimestampBetween(
            anyString(), any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(Arrays.asList());

        // Act
        List<MarketData> result = marketDataService.getHistoricalData(
            "EUR/USD", LocalDateTime.now().minusHours(1), LocalDateTime.now());

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
} 