package com.foreigntrading.service;

import com.foreigntrading.entity.Account;
import com.foreigntrading.entity.User;
import com.foreigntrading.exception.ResourceNotFoundException;
import com.foreigntrading.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final AccountRepository accountRepository;
    private final UserService userService;

    @Transactional
    public Account createAccount(Long userId, String currency) {
        User user = userService.getUserById(userId);
        
        Account account = new Account();
        account.setUser(user);
        account.setCurrency(currency);
        account.setBalance(BigDecimal.ZERO);
        account.setAccountNumber(generateAccountNumber());
        account.setActive(true);
        
        return accountRepository.save(account);
    }

    public Account getAccountById(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + id));
    }

    public List<Account> getUserAccounts(Long userId) {
        return accountRepository.findByUserId(userId);
    }

    @Transactional
    public Account updateBalance(Long accountId, BigDecimal amount) {
        Account account = getAccountById(accountId);
        BigDecimal newBalance = account.getBalance().add(amount);
        
        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Account balance cannot be negative");
        }
        
        account.setBalance(newBalance);
        return accountRepository.save(account);
    }

    public boolean hasSufficientFunds(Long accountId, BigDecimal amount) {
        Account account = getAccountById(accountId);
        return account.getBalance().compareTo(amount) >= 0;
    }

    @Transactional
    public void deactivateAccount(Long accountId) {
        Account account = getAccountById(accountId);
        account.setActive(false);
        accountRepository.save(account);
    }

    private String generateAccountNumber() {
        return UUID.randomUUID().toString().replaceAll("-", "").substring(0, 12);
    }

    public Account getAccountByCurrencyAndUserId(Long userId, String currency) {
        return accountRepository.findByUserIdAndCurrency(userId, currency)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Account not found for user id: " + userId + " and currency: " + currency));
    }

    @Transactional
    public void linkStripeAccount(Long accountId, String stripeAccountId) {
        Account account = getAccountById(accountId);
        account.setStripeAccountId(stripeAccountId);
        accountRepository.save(account);
    }
}

