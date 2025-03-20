package com.foreigntrading.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Alert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String baseCurrency;

    @Column(nullable = false)
    private String quoteCurrency;

    @Column(nullable = false)
    private BigDecimal targetPrice;

    @Column(nullable = false)
    private String condition; // ABOVE, BELOW, EQUALS

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private boolean triggered = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime triggeredAt;

    @Column(nullable = false)
    private String notificationType; // EMAIL, PUSH, BOTH

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public void trigger() {
        this.triggered = true;
        this.triggeredAt = LocalDateTime.now();
        this.active = false;
    }

    public boolean isConditionMet(BigDecimal currentPrice) {
        if (!active || triggered) return false;

        switch (condition) {
            case "ABOVE":
                return currentPrice.compareTo(targetPrice) >= 0;
            case "BELOW":
                return currentPrice.compareTo(targetPrice) <= 0;
            case "EQUALS":
                return currentPrice.compareTo(targetPrice) == 0;
            default:
                return false;
        }
    }

    public String getAlertMessage() {
        return String.format("Price alert for %s/%s: Current price is %s %s",
                baseCurrency, quoteCurrency, condition.toLowerCase(), targetPrice);
    }
} 