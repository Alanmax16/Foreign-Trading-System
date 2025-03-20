package com.foreigntrading.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    public void sendPushNotification(Long userId, String title, String message) {
        // TODO: Implement push notification service integration
        // This could be integrated with Firebase Cloud Messaging, OneSignal, or other push notification services
        System.out.println("Push notification sent to user " + userId + ": " + title + " - " + message);
    }

    public void sendPasswordResetEmail(String to, String resetToken) {
        String subject = "Password Reset Request";
        String text = "To reset your password, click the following link: " +
                "http://localhost:8080/api/auth/reset-password?token=" + resetToken;
        sendEmail(to, subject, text);
    }

    public void sendMfaCode(String to, String mfaCode) {
        String subject = "MFA Code";
        String text = "Your MFA code is: " + mfaCode + "\nThis code will expire in 5 minutes.";
        sendEmail(to, subject, text);
    }

    public void sendAccountActivationEmail(String to, String activationToken) {
        String subject = "Account Activation";
        String text = "To activate your account, click the following link: " +
                "http://localhost:8080/api/auth/activate?token=" + activationToken;
        sendEmail(to, subject, text);
    }

    public void sendTradeConfirmationEmail(String to, String tradeDetails) {
        String subject = "Trade Confirmation";
        String text = "Your trade has been executed successfully.\n\nTrade Details:\n" + tradeDetails;
        sendEmail(to, subject, text);
    }

    public void sendDepositConfirmationEmail(String to, String depositDetails) {
        String subject = "Deposit Confirmation";
        String text = "Your deposit has been processed successfully.\n\nDeposit Details:\n" + depositDetails;
        sendEmail(to, subject, text);
    }

    public void sendWithdrawalConfirmationEmail(String to, String withdrawalDetails) {
        String subject = "Withdrawal Confirmation";
        String text = "Your withdrawal request has been processed successfully.\n\nWithdrawal Details:\n" + withdrawalDetails;
        sendEmail(to, subject, text);
    }

    public void sendAlertNotification(String to, String alertDetails) {
        String subject = "Price Alert Triggered";
        String text = "Your price alert has been triggered.\n\nAlert Details:\n" + alertDetails;
        sendEmail(to, subject, text);
    }
} 