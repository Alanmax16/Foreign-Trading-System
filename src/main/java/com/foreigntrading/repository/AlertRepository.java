package com.foreigntrading.repository;

import com.foreigntrading.entity.Alert;
import com.foreigntrading.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByUser(User user);
    List<Alert> findByUserAndActive(User user, boolean active);
    List<Alert> findByUserAndTriggered(User user, boolean triggered);
    
    List<Alert> findByUserAndBaseCurrencyAndQuoteCurrencyAndActive(
            User user, String baseCurrency, String quoteCurrency, boolean active);
    
    List<Alert> findByUserAndBaseCurrencyAndQuoteCurrencyAndConditionAndActive(
            User user, String baseCurrency, String quoteCurrency, String condition, boolean active);
    
    boolean existsByUserAndBaseCurrencyAndQuoteCurrencyAndActive(
            User user, String baseCurrency, String quoteCurrency, boolean active);
} 