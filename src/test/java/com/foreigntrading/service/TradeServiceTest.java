package com.foreigntrading.service;

import com.foreigntrading.exception.InsufficientFundsException;
import com.foreigntrading.exception.ResourceNotFoundException;
import com.foreigntrading.model.Trade;
import com.foreigntrading.model.User;
import com.foreigntrading.model.Account;
import com.foreigntrading.repository.TradeRepository;
import com.foreigntrading.repository.AccountRepository;
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
class TradeServiceTest {

    @Mock
    private TradeRepository tradeRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private MarketDataService marketDataService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private TradeService tradeService;

    private User testUser;
    private Account testAccount;
    private Trade testTrade;

    @BeforeEach
    void setUp() {
        testUser = TestHelper.createTestRegularUser(passwordEncoder);
        
        testAccount = new Account();
        testAccount.setId(1L);
        testAccount.setUser(testUser);
        testAccount.setBalance(new BigDecimal("10000.00"));
        testAccount.setCurrency("USD");

        testTrade = new Trade();
        testTrade.setId(1L);
        testTrade.setUser(testUser);
        testTrade.setAccount(testAccount);
        testTrade.setCurrencyPair("EUR/USD");
        testTrade.setAmount(new BigDecimal("1000.00"));
        testTrade.setPrice(new BigDecimal("1.1234"));
        testTrade.setType(Trade.TradeType.BUY);
        testTrade.setStatus(Trade.TradeStatus.COMPLETED);
        testTrade.setTimestamp(LocalDateTime.now());
    }

    @Test
    void executeTrade_WhenValidTrade_SavesTrade() {
        // Arrange
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));
        when(marketDataService.getLatestMarketData("EUR/USD")).thenReturn(createTestMarketData());
        when(tradeRepository.save(any(Trade.class))).thenReturn(testTrade);

        // Act
        Trade result = tradeService.executeTrade(1L, testTrade);

        // Assert
        assertNotNull(result);
        assertEquals(testTrade.getCurrencyPair(), result.getCurrencyPair());
        assertEquals(testTrade.getAmount(), result.getAmount());
        assertEquals(testTrade.getType(), result.getType());
        verify(tradeRepository).save(any(Trade.class));
    }

    @Test
    void executeTrade_WhenAccountNotFound_ThrowsException() {
        // Arrange
        when(accountRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> tradeService.executeTrade(1L, testTrade));
    }

    @Test
    void executeTrade_WhenInsufficientFunds_ThrowsException() {
        // Arrange
        testAccount.setBalance(new BigDecimal("100.00"));
        testTrade.setAmount(new BigDecimal("1000.00"));
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));

        // Act & Assert
        assertThrows(InsufficientFundsException.class, () -> tradeService.executeTrade(1L, testTrade));
    }

    @Test
    void getTradeById_WhenTradeExists_ReturnsTrade() {
        // Arrange
        when(tradeRepository.findById(1L)).thenReturn(Optional.of(testTrade));

        // Act
        Trade result = tradeService.getTradeById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(testTrade.getCurrencyPair(), result.getCurrencyPair());
        assertEquals(testTrade.getAmount(), result.getAmount());
        assertEquals(testTrade.getType(), result.getType());
    }

    @Test
    void getTradeById_WhenTradeDoesNotExist_ThrowsException() {
        // Arrange
        when(tradeRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> tradeService.getTradeById(1L));
    }

    @Test
    void getUserTrades_ReturnsUserTrades() {
        // Arrange
        List<Trade> trades = Arrays.asList(testTrade);
        when(tradeRepository.findByUserId(1L)).thenReturn(trades);

        // Act
        List<Trade> result = tradeService.getUserTrades(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testTrade.getCurrencyPair(), result.get(0).getCurrencyPair());
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