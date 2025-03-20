package com.foreigntrading.service;

import com.foreigntrading.exception.InsufficientFundsException;
import com.foreigntrading.exception.ResourceNotFoundException;
import com.foreigntrading.model.Account;
import com.foreigntrading.model.User;
import com.foreigntrading.repository.AccountRepository;
import com.foreigntrading.util.TestHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AccountService accountService;

    private User testUser;
    private Account testAccount;

    @BeforeEach
    void setUp() {
        testUser = TestHelper.createTestRegularUser(passwordEncoder);
        
        testAccount = new Account();
        testAccount.setId(1L);
        testAccount.setUser(testUser);
        testAccount.setBalance(new BigDecimal("10000.00"));
        testAccount.setCurrency("USD");
    }

    @Test
    void createAccount_WhenAccountIsValid_SavesAccount() {
        // Arrange
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        // Act
        Account result = accountService.createAccount(testAccount);

        // Assert
        assertNotNull(result);
        assertEquals(testAccount.getUser(), result.getUser());
        assertEquals(testAccount.getBalance(), result.getBalance());
        assertEquals(testAccount.getCurrency(), result.getCurrency());
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void getAccountById_WhenAccountExists_ReturnsAccount() {
        // Arrange
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));

        // Act
        Account result = accountService.getAccountById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(testAccount.getUser(), result.getUser());
        assertEquals(testAccount.getBalance(), result.getBalance());
        assertEquals(testAccount.getCurrency(), result.getCurrency());
    }

    @Test
    void getAccountById_WhenAccountDoesNotExist_ThrowsException() {
        // Arrange
        when(accountRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> accountService.getAccountById(1L));
    }

    @Test
    void updateAccount_WhenAccountExists_UpdatesAccount() {
        // Arrange
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        // Act
        Account result = accountService.updateAccount(1L, testAccount);

        // Assert
        assertNotNull(result);
        assertEquals(testAccount.getUser(), result.getUser());
        assertEquals(testAccount.getBalance(), result.getBalance());
        assertEquals(testAccount.getCurrency(), result.getCurrency());
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void updateAccount_WhenAccountDoesNotExist_ThrowsException() {
        // Arrange
        when(accountRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> accountService.updateAccount(1L, testAccount));
    }

    @Test
    void deleteAccount_WhenAccountExists_DeletesAccount() {
        // Arrange
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));

        // Act
        accountService.deleteAccount(1L);

        // Assert
        verify(accountRepository).delete(testAccount);
    }

    @Test
    void deleteAccount_WhenAccountDoesNotExist_ThrowsException() {
        // Arrange
        when(accountRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> accountService.deleteAccount(1L));
    }

    @Test
    void getUserAccounts_ReturnsUserAccounts() {
        // Arrange
        List<Account> accounts = Arrays.asList(testAccount);
        when(accountRepository.findByUserId(1L)).thenReturn(accounts);

        // Act
        List<Account> result = accountService.getUserAccounts(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testAccount.getCurrency(), result.get(0).getCurrency());
    }

    @Test
    void deposit_WhenAccountExists_UpdatesBalance() {
        // Arrange
        BigDecimal depositAmount = new BigDecimal("1000.00");
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        // Act
        Account result = accountService.deposit(1L, depositAmount);

        // Assert
        assertNotNull(result);
        assertEquals(new BigDecimal("11000.00"), result.getBalance());
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void withdraw_WhenSufficientFunds_UpdatesBalance() {
        // Arrange
        BigDecimal withdrawAmount = new BigDecimal("1000.00");
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        // Act
        Account result = accountService.withdraw(1L, withdrawAmount);

        // Assert
        assertNotNull(result);
        assertEquals(new BigDecimal("9000.00"), result.getBalance());
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void withdraw_WhenInsufficientFunds_ThrowsException() {
        // Arrange
        BigDecimal withdrawAmount = new BigDecimal("11000.00");
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));

        // Act & Assert
        assertThrows(InsufficientFundsException.class, () -> accountService.withdraw(1L, withdrawAmount));
    }
} 