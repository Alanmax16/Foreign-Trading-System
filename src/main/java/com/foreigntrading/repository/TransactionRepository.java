package com.foreigntrading.repository;

import com.foreigntrading.entity.Account;
import com.foreigntrading.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByAccount(Account account, Pageable pageable);
    List<Transaction> findByAccountAndStatus(Account account, String status);
    List<Transaction> findByAccountAndCreatedAtBetween(Account account, LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT t FROM Transaction t WHERE t.account = ?1 AND t.status = 'PENDING'")
    List<Transaction> findPendingTransactions(Account account);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.account = ?1 AND t.status = 'COMPLETED' AND t.transactionType = ?2")
    Double calculateTotalByType(Account account, String transactionType);
    
    @Query("SELECT t FROM Transaction t WHERE t.account = ?1 AND t.status = 'COMPLETED' ORDER BY t.completedAt DESC")
    List<Transaction> findRecentCompletedTransactions(Account account);
    
    Optional<Transaction> findByReferenceNumber(String referenceNumber);
} 