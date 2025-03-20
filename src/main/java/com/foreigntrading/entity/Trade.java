package com.foreigntrading.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "trades")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Trade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(nullable = false)
    private String baseCurrency;

    @Column(nullable = false)
    private String quoteCurrency;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private String orderType; // MARKET, LIMIT, STOP_LOSS, TAKE_PROFIT

    @Column(nullable = false)
    private String side; // BUY, SELL

    @Column(nullable = false)
    private String status; // PENDING, EXECUTED, CANCELLED, REJECTED

    private BigDecimal stopLossPrice;
    private BigDecimal takeProfitPrice;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime executedAt;
    private LocalDateTime cancelledAt;

    @Column(nullable = false)
    private BigDecimal profitLoss;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        profitLoss = BigDecimal.ZERO;
    }

    public void execute(BigDecimal executionPrice) {
        this.status = "EXECUTED";
        this.executedAt = LocalDateTime.now();
        this.price = executionPrice;
        calculateProfitLoss();
    }

    public void cancel() {
        this.status = "CANCELLED";
        this.cancelledAt = LocalDateTime.now();
    }

    private void calculateProfitLoss() {
        if (side.equals("BUY")) {
            this.profitLoss = amount.multiply(price.subtract(this.price));
        } else {
            this.profitLoss = amount.multiply(this.price.subtract(price));
        }
    }

    public boolean isStopLossTriggered(BigDecimal currentPrice) {
        if (stopLossPrice == null) return false;
        return side.equals("BUY") ? currentPrice <= stopLossPrice : currentPrice >= stopLossPrice;
    }

    public boolean isTakeProfitTriggered(BigDecimal currentPrice) {
        if (takeProfitPrice == null) return false;
        return side.equals("BUY") ? currentPrice >= takeProfitPrice : currentPrice <= takeProfitPrice;
    }
} 