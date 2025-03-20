package com.foreigntrading.repository;

import com.foreigntrading.entity.Account;
import com.foreigntrading.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByAccount(Account account, Pageable pageable);
    List<Order> findByAccountAndStatus(Account account, String status);
    List<Order> findByAccountAndCreatedAtBetween(Account account, LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT o FROM Order o WHERE o.account = ?1 AND o.status = 'PENDING' AND " +
           "((o.orderType = 'STOP_LOSS' AND o.stopLossPrice IS NOT NULL) OR " +
           "(o.orderType = 'TAKE_PROFIT' AND o.takeProfitPrice IS NOT NULL))")
    List<Order> findPendingStopLossAndTakeProfitOrders(Account account);
    
    @Query("SELECT o FROM Order o WHERE o.account = ?1 AND o.status = 'PENDING' AND o.orderType = 'LIMIT'")
    List<Order> findPendingLimitOrders(Account account);
    
    @Query("SELECT o FROM Order o WHERE o.account = ?1 AND o.status = 'EXECUTED' ORDER BY o.executedAt DESC")
    List<Order> findRecentExecutedOrders(Account account);
    
    @Query("SELECT SUM(o.totalCost) FROM Order o WHERE o.account = ?1 AND o.status = 'EXECUTED'")
    Double calculateTotalOrderValue(Account account);
} 