package com.foreigntrading.service;

import com.foreigntrading.entity.Transaction;
import com.foreigntrading.entity.Account;
import com.foreigntrading.entity.Trade;
import com.foreigntrading.repository.TransactionRepository;
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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final AccountService accountService;

    @Transactional
    public Transaction createTransaction(Long accountId, String transactionType, BigDecimal amount,
                                      String currency, String description, String paymentMethod) {
        Account account = accountService.getAccountById(accountId);

        if (!account.isActive()) {
            throw new IllegalStateException("Account is not active");
        }

        if (amount.compareTo(BigDecimal.ZERO) < 0 && !accountService.hasSufficientFunds(accountId, amount.abs())) {
            throw new InsufficientFundsException("Insufficient funds for transaction");
        }

        Transaction transaction = new Transaction();
        transaction.setAccount(account);
        transaction.setTransactionType(transactionType);
        transaction.setAmount(amount);
        transaction.setCurrency(currency);
        transaction.setStatus("PENDING");
        transaction.setDescription(description);
        transaction.setPaymentMethod(paymentMethod);
        transaction.setReferenceNumber(generateReferenceNumber());
        transaction.setCreatedAt(LocalDateTime.now());

        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction createTradeTransaction(Account account, Trade trade, BigDecimal amount) {
        Transaction transaction = new Transaction();
        transaction.setAccount(account);
        transaction.setTransactionType("TRADE");
        transaction.setAmount(amount);
        transaction.setCurrency(account.getCurrency());
        transaction.setStatus("PENDING");
        transaction.setDescription("Trade execution: " + trade.getBaseCurrency() + "/" + trade.getQuoteCurrency());
        transaction.setTrade(trade);
        transaction.setCreatedAt(LocalDateTime.now());

        return transactionRepository.save(transaction);
    }

    @Transactional(readOnly = true)
    public Transaction getTransactionById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Transaction getTransactionByReferenceNumber(String referenceNumber) {
        return transactionRepository.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with reference number: " + referenceNumber));
    }

    @Transactional(readOnly = true)
    public Page<Transaction> getAccountTransactions(Long accountId, Pageable pageable) {
        Account account = accountService.getAccountById(accountId);
        return transactionRepository.findByAccount(account, pageable);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getAccountTransactionsByStatus(Long accountId, String status) {
        Account account = accountService.getAccountById(accountId);
        return transactionRepository.findByAccountAndStatus(account, status);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getAccountTransactionsByDateRange(Long accountId, LocalDateTime start, LocalDateTime end) {
        Account account = accountService.getAccountById(accountId);
        return transactionRepository.findByAccountAndCreatedAtBetween(account, start, end);
    }

    @Transactional
    public void completeTransaction(Long transactionId) {
        Transaction transaction = getTransactionById(transactionId);
        transaction.complete();
        transactionRepository.save(transaction);
    }

    @Transactional
    public void failTransaction(Long transactionId) {
        Transaction transaction = getTransactionById(transactionId);
        transaction.fail();
        transactionRepository.save(transaction);
    }

    @Transactional
    public void cancelTransaction(Long transactionId) {
        Transaction transaction = getTransactionById(transactionId);
        transaction.cancel();
        transactionRepository.save(transaction);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getPendingTransactions(Long accountId) {
        Account account = accountService.getAccountById(accountId);
        return transactionRepository.findPendingTransactions(account);
    }

    @Transactional(readOnly = true)
    public Double calculateTotalByType(Long accountId, String transactionType) {
        Account account = accountService.getAccountById(accountId);
        return transactionRepository.calculateTotalByType(account, transactionType);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getRecentCompletedTransactions(Long accountId) {
        Account account = accountService.getAccountById(accountId);
        return transactionRepository.findRecentCompletedTransactions(account);
    }

    private String generateReferenceNumber() {
        String referenceNumber;
        do {
            referenceNumber = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        } while (transactionRepository.findByReferenceNumber(referenceNumber).isPresent());
        return referenceNumber;
    }
} 