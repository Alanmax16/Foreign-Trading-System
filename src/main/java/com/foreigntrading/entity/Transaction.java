package com.foreigntrading.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(nullable = false)
    private String transactionType; // DEPOSIT, WITHDRAWAL, TRADE, FEE

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency;

    @Column(nullable = false)
    private String status; // PENDING, COMPLETED, FAILED, CANCELLED

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime completedAt;
    private LocalDateTime failedAt;
    private LocalDateTime cancelledAt;

    private String description;
    private String referenceNumber;
    private String paymentMethod; // CREDIT_CARD, BANK_TRANSFER, E_WALLET

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trade_id")
    private Trade trade;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public void complete() {
        this.status = "COMPLETED";
        this.completedAt = LocalDateTime.now();
        this.account.updateBalance(this.amount);
    }

    public void fail() {
        this.status = "FAILED";
        this.failedAt = LocalDateTime.now();
    }

    public void cancel() {
        this.status = "CANCELLED";
        this.cancelledAt = LocalDateTime.now();
    }

    public boolean isPositive() {
        return amount.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isNegative() {
        return amount.compareTo(BigDecimal.ZERO) < 0;
    }
} 