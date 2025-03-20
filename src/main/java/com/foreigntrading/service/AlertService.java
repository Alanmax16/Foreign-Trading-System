package com.foreigntrading.service;

import com.foreigntrading.entity.Alert;
import com.foreigntrading.entity.User;
import com.foreigntrading.repository.AlertRepository;
import com.foreigntrading.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {
    private final AlertRepository alertRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    @Transactional
    public Alert createAlert(Long userId, String baseCurrency, String quoteCurrency,
                           BigDecimal targetPrice, String condition, String notificationType) {
        User user = userService.getUserById(userId);

        if (alertRepository.existsByUserAndBaseCurrencyAndQuoteCurrencyAndActive(
                user, baseCurrency, quoteCurrency, true)) {
            throw new IllegalStateException("Active alert already exists for this currency pair");
        }

        Alert alert = new Alert();
        alert.setUser(user);
        alert.setBaseCurrency(baseCurrency);
        alert.setQuoteCurrency(quoteCurrency);
        alert.setTargetPrice(targetPrice);
        alert.setCondition(condition);
        alert.setActive(true);
        alert.setNotificationType(notificationType);
        alert.setCreatedAt(LocalDateTime.now());

        return alertRepository.save(alert);
    }

    @Transactional(readOnly = true)
    public Alert getAlertById(Long id) {
        return alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Alert> getUserAlerts(Long userId) {
        User user = userService.getUserById(userId);
        return alertRepository.findByUser(user);
    }

    @Transactional(readOnly = true)
    public List<Alert> getUserActiveAlerts(Long userId) {
        User user = userService.getUserById(userId);
        return alertRepository.findByUserAndActive(user, true);
    }

    @Transactional(readOnly = true)
    public List<Alert> getUserTriggeredAlerts(Long userId) {
        User user = userService.getUserById(userId);
        return alertRepository.findByUserAndTriggered(user, true);
    }

    @Transactional
    public void deactivateAlert(Long alertId) {
        Alert alert = getAlertById(alertId);
        alert.setActive(false);
        alertRepository.save(alert);
    }

    @Transactional
    public void deleteAlert(Long alertId) {
        Alert alert = getAlertById(alertId);
        alertRepository.delete(alert);
    }

    @Transactional
    public void checkAndTriggerAlerts(Long userId, String baseCurrency, String quoteCurrency, BigDecimal currentPrice) {
        User user = userService.getUserById(userId);
        List<Alert> activeAlerts = alertRepository.findByUserAndBaseCurrencyAndQuoteCurrencyAndActive(
                user, baseCurrency, quoteCurrency, true);

        for (Alert alert : activeAlerts) {
            if (alert.isConditionMet(currentPrice)) {
                triggerAlert(alert);
            }
        }
    }

    @Transactional
    public void triggerAlert(Alert alert) {
        alert.trigger();
        alertRepository.save(alert);

        // Send notification based on notification type
        String message = alert.getAlertMessage();
        switch (alert.getNotificationType()) {
            case "EMAIL":
                notificationService.sendEmail(alert.getUser().getEmail(), "Price Alert", message);
                break;
            case "PUSH":
                notificationService.sendPushNotification(alert.getUser().getId(), "Price Alert", message);
                break;
            case "BOTH":
                notificationService.sendEmail(alert.getUser().getEmail(), "Price Alert", message);
                notificationService.sendPushNotification(alert.getUser().getId(), "Price Alert", message);
                break;
        }
    }

    @Transactional(readOnly = true)
    public List<Alert> getAlertsByCurrencyPair(Long userId, String baseCurrency, String quoteCurrency) {
        User user = userService.getUserById(userId);
        return alertRepository.findByUserAndBaseCurrencyAndQuoteCurrencyAndActive(
                user, baseCurrency, quoteCurrency, true);
    }

    @Transactional(readOnly = true)
    public List<Alert> getAlertsByCondition(Long userId, String baseCurrency, String quoteCurrency, String condition) {
        User user = userService.getUserById(userId);
        return alertRepository.findByUserAndBaseCurrencyAndQuoteCurrencyAndConditionAndActive(
                user, baseCurrency, quoteCurrency, condition, true);
    }
} 