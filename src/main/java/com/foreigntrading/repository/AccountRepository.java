package com.foreigntrading.repository;

import com.foreigntrading.entity.Account;
import com.foreigntrading.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUser(User user);
    Optional<Account> findByAccountNumber(String accountNumber);
    List<Account> findByUserAndAccountType(User user, String accountType);
    boolean existsByAccountNumber(String accountNumber);
} 