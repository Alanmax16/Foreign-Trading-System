package com.foreigntrading.service;

import com.foreigntrading.entity.Account;
import com.foreigntrading.entity.Transaction;
import com.foreigntrading.exception.InsufficientFundsException;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final TransactionService transactionService;
    private final AccountService accountService;

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Value("${stripe.webhook.secret}")
    private String stripeWebhookSecret;

    public PaymentIntent createPaymentIntent(Account account, BigDecimal amount, String currency) throws StripeException {
        Stripe.apiKey = stripeSecretKey;

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
            .setAmount(amount.multiply(new BigDecimal("100")).longValue()) // Convert to cents
            .setCurrency(currency.toLowerCase())
            .setAutomaticPaymentMethods(
                PaymentIntentCreateParams.AutomaticPaymentMethods
                    .builder()
                    .setEnabled(true)
                    .build()
            )
            .setMetadata(Map.of(
                "accountId", account.getId().toString(),
                "accountNumber", account.getAccountNumber()
            ))
            .build();

        return PaymentIntent.create(params);
    }

    @Transactional
    public Transaction processDeposit(Account account, String paymentIntentId) throws StripeException {
        Stripe.apiKey = stripeSecretKey;
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

        if (!"succeeded".equals(paymentIntent.getStatus())) {
            throw new IllegalStateException("Payment has not been completed");
        }

        BigDecimal amount = new BigDecimal(paymentIntent.getAmount()).divide(new BigDecimal("100"));
        String currency = paymentIntent.getCurrency().toUpperCase();

        Transaction transaction = transactionService.createTransaction(
            account.getId(),
            "DEPOSIT",
            amount,
            currency,
            "Deposit via Stripe",
            "STRIPE"
        );

        transactionService.completeTransaction(transaction.getId());
        return transaction;
    }

    @Transactional
    public Transaction processWithdrawal(Account account, BigDecimal amount, String currency) throws StripeException {
        if (!accountService.hasSufficientFunds(account.getId(), amount)) {
            throw new InsufficientFundsException("Insufficient funds for withdrawal");
        }

        Stripe.apiKey = stripeSecretKey;

        // Create a transfer to the user's connected account
        Map<String, Object> transferParams = new HashMap<>();
        transferParams.put("amount", amount.multiply(new BigDecimal("100")).longValue());
        transferParams.put("currency", currency.toLowerCase());
        transferParams.put("destination", account.getStripeAccountId());

        com.stripe.model.Transfer transfer = com.stripe.model.Transfer.create(transferParams);

        Transaction transaction = transactionService.createTransaction(
            account.getId(),
            "WITHDRAWAL",
            amount.negate(),
            currency,
            "Withdrawal via Stripe",
            "STRIPE"
        );

        transactionService.completeTransaction(transaction.getId());
        return transaction;
    }

    public void handleWebhook(String payload, String signature) throws StripeException {
        Stripe.apiKey = stripeSecretKey;
        com.stripe.model.Event event = com.stripe.net.Webhook.constructEvent(
            payload, signature, stripeWebhookSecret
        );

        switch (event.getType()) {
            case "payment_intent.succeeded":
                handlePaymentIntentSucceeded(event);
                break;
            case "payment_intent.payment_failed":
                handlePaymentIntentFailed(event);
                break;
            // Add more event handlers as needed
        }
    }

    private void handlePaymentIntentSucceeded(com.stripe.model.Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getData().getObject();
        String accountId = paymentIntent.getMetadata().get("accountId");
        
        try {
            processDeposit(
                accountService.getAccountById(Long.parseLong(accountId)),
                paymentIntent.getId()
            );
        } catch (Exception e) {
            // Log error and handle appropriately
            System.err.println("Error processing payment: " + e.getMessage());
        }
    }

    private void handlePaymentIntentFailed(com.stripe.model.Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getData().getObject();
        String accountId = paymentIntent.getMetadata().get("accountId");
        
        try {
            Transaction transaction = transactionService.createTransaction(
                Long.parseLong(accountId),
                "DEPOSIT",
                new BigDecimal(paymentIntent.getAmount()).divide(new BigDecimal("100")),
                paymentIntent.getCurrency().toUpperCase(),
                "Failed deposit via Stripe",
                "STRIPE"
            );
            transactionService.failTransaction(transaction.getId());
        } catch (Exception e) {
            // Log error and handle appropriately
            System.err.println("Error handling failed payment: " + e.getMessage());
        }
    }
} 