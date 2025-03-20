package com.foreigntrading.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
    private LocalDateTime rejectedAt;

    @Column(nullable = false)
    private BigDecimal totalCost;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        calculateTotalCost();
    }

    public void execute(BigDecimal executionPrice) {
        this.status = "EXECUTED";
        this.executedAt = LocalDateTime.now();
        this.price = executionPrice;
        calculateTotalCost();
    }

    public void cancel() {
        this.status = "CANCELLED";
        this.cancelledAt = LocalDateTime.now();
    }

    public void reject() {
        this.status = "REJECTED";
        this.rejectedAt = LocalDateTime.now();
    }

    private void calculateTotalCost() {
        this.totalCost = amount.multiply(price);
    }

    public boolean isStopLossTriggered(BigDecimal currentPrice) {
        if (stopLossPrice == null) return false;
        return side.equals("BUY") ? currentPrice <= stopLossPrice : currentPrice >= stopLossPrice;
    }

    public boolean isTakeProfitTriggered(BigDecimal currentPrice) {
        if (takeProfitPrice == null) return false;
        return side.equals("BUY") ? currentPrice >= takeProfitPrice : currentPrice <= takeProfitPrice;
    }

    public boolean isLimitOrder() {
        return orderType.equals("LIMIT");
    }

    public boolean isMarketOrder() {
        return orderType.equals("MARKET");
    }

    public boolean isStopLossOrder() {
        return orderType.equals("STOP_LOSS");
    }

    public boolean isTakeProfitOrder() {
        return orderType.equals("TAKE_PROFIT");
    }

    public boolean isBuyOrder() {
        return side.equals("BUY");
    }

    public boolean isSellOrder() {
        return side.equals("SELL");
    }
} 