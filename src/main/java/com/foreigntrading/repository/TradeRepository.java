package com.foreigntrading.repository;

import com.foreigntrading.entity.Trade;
import com.foreigntrading.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TradeRepository extends JpaRepository<Trade, Long> {
    Page<Trade> findByUser(User user, Pageable pageable);
    List<Trade> findByUserAndStatus(User user, String status);
    List<Trade> findByUserAndCreatedAtBetween(User user, LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT t FROM Trade t WHERE t.user = ?1 AND t.status = 'PENDING' AND " +
           "((t.orderType = 'STOP_LOSS' AND t.stopLossPrice IS NOT NULL) OR " +
           "(t.orderType = 'TAKE_PROFIT' AND t.takeProfitPrice IS NOT NULL))")
    List<Trade> findPendingStopLossAndTakeProfitOrders(User user);
    
    @Query("SELECT SUM(t.profitLoss) FROM Trade t WHERE t.user = ?1 AND t.status = 'EXECUTED'")
    Double calculateTotalProfitLoss(User user);
    
    @Query("SELECT t FROM Trade t WHERE t.user = ?1 AND t.status = 'EXECUTED' ORDER BY t.executedAt DESC")
    List<Trade> findRecentExecutedTrades(User user);
} 