package com.foreigntrading.service;

import com.foreigntrading.entity.Trade;
import com.foreigntrading.entity.Account;
import com.foreigntrading.entity.User;
import com.foreigntrading.repository.TradeRepository;
import com.foreigntrading.exception.ResourceNotFoundException;
import com.foreigntrading.exception.InsufficientFundsException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TradeService {
    private final TradeRepository tradeRepository;
    private final AccountService accountService;
    private final UserService userService;

    @Transactional
    public Trade createTrade(Long userId, Long accountId, String baseCurrency, String quoteCurrency,
                           BigDecimal amount, BigDecimal price, String orderType, String side,
                           BigDecimal stopLossPrice, BigDecimal takeProfitPrice) {
        User user = userService.getUserById(userId);
        Account account = accountService.getAccountById(accountId);

        if (!account.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Account does not belong to user");
        }

        if (!account.isActive()) {
            throw new IllegalStateException("Account is not active");
        }

        BigDecimal totalCost = amount.multiply(price);
        if (!accountService.hasSufficientFunds(accountId, totalCost)) {
            throw new InsufficientFundsException("Insufficient funds for trade");
        }

        Trade trade = new Trade();
        trade.setUser(user);
        trade.setAccount(account);
        trade.setBaseCurrency(baseCurrency);
        trade.setQuoteCurrency(quoteCurrency);
        trade.setAmount(amount);
        trade.setPrice(price);
        trade.setOrderType(orderType);
        trade.setSide(side);
        trade.setStatus("PENDING");
        trade.setStopLossPrice(stopLossPrice);
        trade.setTakeProfitPrice(takeProfitPrice);
        trade.setCreatedAt(LocalDateTime.now());

        return tradeRepository.save(trade);
    }

    @Transactional(readOnly = true)
    public Trade getTradeById(Long id) {
        return tradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trade not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Page<Trade> getUserTrades(Long userId, Pageable pageable) {
        User user = userService.getUserById(userId);
        return tradeRepository.findByUser(user, pageable);
    }

    @Transactional(readOnly = true)
    public List<Trade> getUserTradesByStatus(Long userId, String status) {
        User user = userService.getUserById(userId);
        return tradeRepository.findByUserAndStatus(user, status);
    }

    @Transactional(readOnly = true)
    public List<Trade> getUserTradesByDateRange(Long userId, LocalDateTime start, LocalDateTime end) {
        User user = userService.getUserById(userId);
        return tradeRepository.findByUserAndCreatedAtBetween(user, start, end);
    }

    @Transactional
    public void executeTrade(Long tradeId, BigDecimal executionPrice) {
        Trade trade = getTradeById(tradeId);
        trade.execute(executionPrice);
        tradeRepository.save(trade);
    }

    @Transactional
    public void cancelTrade(Long tradeId) {
        Trade trade = getTradeById(tradeId);
        trade.cancel();
        tradeRepository.save(trade);
    }

    @Transactional(readOnly = true)
    public List<Trade> getPendingStopLossAndTakeProfitOrders(Long userId) {
        User user = userService.getUserById(userId);
        return tradeRepository.findPendingStopLossAndTakeProfitOrders(user);
    }

    @Transactional(readOnly = true)
    public Double calculateTotalProfitLoss(Long userId) {
        User user = userService.getUserById(userId);
        return tradeRepository.calculateTotalProfitLoss(user);
    }

    @Transactional(readOnly = true)
    public List<Trade> getRecentExecutedTrades(Long userId) {
        User user = userService.getUserById(userId);
        return tradeRepository.findRecentExecutedTrades(user);
    }

    @Transactional
    public void checkAndExecuteStopLossOrders(Long userId, BigDecimal currentPrice) {
        List<Trade> pendingOrders = getPendingStopLossAndTakeProfitOrders(userId);
        for (Trade trade : pendingOrders) {
            if (trade.isStopLossTriggered(currentPrice)) {
                executeTrade(trade.getId(), currentPrice);
            }
        }
    }

    @Transactional
    public void checkAndExecuteTakeProfitOrders(Long userId, BigDecimal currentPrice) {
        List<Trade> pendingOrders = getPendingStopLossAndTakeProfitOrders(userId);
        for (Trade trade : pendingOrders) {
            if (trade.isTakeProfitTriggered(currentPrice)) {
                executeTrade(trade.getId(), currentPrice);
            }
        }
    }
} 