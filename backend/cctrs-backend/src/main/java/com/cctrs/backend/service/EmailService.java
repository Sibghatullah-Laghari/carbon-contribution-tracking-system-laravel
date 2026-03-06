package com.cctrs.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.InternetAddress;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final String fromAddress;

    @Autowired
    public EmailService(JavaMailSender mailSender,
                        @Value("${spring.mail.username:}") String fromEmail) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail == null ? "" : fromEmail.trim();
        this.fromAddress = normalizeFromAddress(this.fromEmail);
        validateMailConfiguration(this.fromEmail, mailSender);
    }

    public void sendApprovalEmail(String toEmail, String activityName) {
        String resolvedFrom = getFromAddressOrLog("approval", toEmail);
        if (resolvedFrom == null) {
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(resolvedFrom);
            message.setTo(toEmail);
            message.setSubject("CCTRS Activity Approved 🌱");
            message.setText(
                    "Your activity '" + activityName + "' has been approved. Points have been added to your account.");
            mailSender.send(message);
            logger.info("Approval email sent successfully to: {}", toEmail);
        } catch (MailException e) {
            logger.error("Failed to send approval email to: {}. Error: {}", toEmail, e.getMessage(), e);
        }
    }

    public void sendRejectionEmail(String toEmail, String activityName) {
        sendRejectionEmailWithReason(toEmail, activityName, null);
    }

    public void sendRejectionEmailWithReason(String toEmail, String activityName, String reason) {
        String resolvedFrom = getFromAddressOrLog("rejection", toEmail);
        if (resolvedFrom == null) {
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(resolvedFrom);
            message.setTo(toEmail);
            message.setSubject("CCTRS Activity Rejected");

            String emailBody = "Your activity '" + activityName + "' was rejected.";
            if (reason != null && !reason.trim().isEmpty()) {
                emailBody += "\n\nReason: " + reason;
            }
            emailBody += "\n\nPlease review and submit again.";

            message.setText(emailBody);
            mailSender.send(message);
            logger.info("Rejection email sent successfully to: {}", toEmail);
        } catch (MailException e) {
            logger.error("Failed to send rejection email to: {}. Error: {}", toEmail, e.getMessage(), e);
        }
    }

    public void sendOtpEmail(String toEmail, String otp) {
        String resolvedFrom = getFromAddressOrLog("otp", toEmail);
        if (resolvedFrom == null) {
            throw new IllegalArgumentException("Mail from address is not configured. Set spring.mail.username.");
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(resolvedFrom);
        message.setTo(toEmail);
        message.setSubject("Your CCTRS OTP Code");
        message.setText("Your OTP code is: " + otp + "\n\nThis code expires in 5 minutes.");
        try {
            mailSender.send(message);
            logger.info("OTP email sent successfully to: {}", toEmail);
        } catch (MailException e) {
            logger.error("Failed to send OTP email to: {}. Error: {}", toEmail, e.getMessage(), e);
            throw new IllegalArgumentException("Failed to send OTP email. Check mail configuration.", e);
        }
    }

    public void sendVerificationEmail(String toEmail, String token) {
        String resolvedFrom = getFromAddressOrLog("verification", toEmail);
        if (resolvedFrom == null) {
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(resolvedFrom);
            message.setTo(toEmail);
            message.setSubject("CCTRS Email Verification");
            message.setText(
                    "Please verify your email by clicking the link: http://localhost:5173/verify?token=" + token);
            mailSender.send(message);
            logger.info("Verification email sent successfully to: {}", toEmail);
        } catch (MailException e) {
            logger.error("Failed to send verification email to: {}. Error: {}", toEmail, e.getMessage(), e);
        }
    }

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        String resolvedFrom = getFromAddressOrLog("password-reset", toEmail);
        if (resolvedFrom == null) {
            throw new IllegalArgumentException("Mail from address is not configured. Set spring.mail.username.");
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(resolvedFrom);
            message.setTo(toEmail);
            message.setSubject("CCTRS - Reset Your Password");
            message.setText(
                    "Hello,\n\n" +
                            "You requested to reset your CCTRS password.\n\n" +
                            "Click the link below to reset your password:\n" +
                            resetLink + "\n\n" +
                            "This link will expire in 30 minutes.\n\n" +
                            "If you did not request this, please ignore this email. " +
                            "Your password will remain unchanged.\n\n" +
                            "CCTRS Team"
            );
            mailSender.send(message);
            logger.info("Password reset email sent successfully to: {}", toEmail);
        } catch (MailException e) {
            logger.error("Failed to send password reset email to: {}. Error: {}", toEmail, e.getMessage(), e);
            throw new IllegalArgumentException("Failed to send password reset email. Check mail configuration.", e);
        }
    }

    private String normalizeFromAddress(String configuredValue) {
        if (configuredValue == null || configuredValue.trim().isEmpty()) {
            logger.error("Mail from address is not configured. Set spring.mail.username.");
            return null;
        }
        try {
            InternetAddress address = new InternetAddress(configuredValue.trim());
            address.validate();
            String plainAddress = address.getAddress();
            if (plainAddress == null || plainAddress.trim().isEmpty()) {
                logger.error("Mail from address is invalid. Set a plain email in spring.mail.username.");
                return null;
            }
            if (address.getPersonal() != null) {
                logger.warn("Mail from address contained a personal name; using address only: {}", plainAddress);
            }
            return plainAddress;
        } catch (Exception e) {
            logger.error("Mail from address is invalid. Set a plain email in spring.mail.username.", e);
            return null;
        }
    }

    private void validateMailConfiguration(String fromEmail, JavaMailSender sender) {
        if (sender instanceof JavaMailSenderImpl mailSenderImpl) {
            String host = mailSenderImpl.getHost();
            if (host == null || host.trim().isEmpty()) {
                logger.warn("Mail host is not configured. Set spring.mail.host.");
            }
            if (mailSenderImpl.getPort() == 0) {
                logger.warn("Mail port is not configured. Set spring.mail.port.");
            }
            String username = mailSenderImpl.getUsername();
            if (username == null || username.trim().isEmpty()) {
                logger.warn("Mail username is not configured. Set spring.mail.username.");
            }
        } else if (fromEmail == null || fromEmail.trim().isEmpty()) {
            logger.warn("Mail sender configuration could not be validated. Ensure spring.mail.* properties are set.");
        }
    }

    private String getFromAddressOrLog(String context, String toEmail) {
        if (fromAddress == null || fromAddress.trim().isEmpty()) {
            logger.error("Cannot send {} email to {}: invalid mail from address. Set spring.mail.username.", context, toEmail);
            return null;
        }
        return fromAddress;
    }

    public void sendQuestionAnswerEmail(String toEmail, String name, String question, String answer) {
        String resolvedFrom = getFromAddressOrLog("question-answer", toEmail);
        if (resolvedFrom == null) return;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(resolvedFrom);
            message.setTo(toEmail);
            message.setSubject("CCTRS — Your Question Has Been Answered");
            message.setText(
                    "Hello " + (name != null && !name.isBlank() ? name : "there") + ",\n\n" +
                            "Thank you for reaching out to CCTRS. Here is the answer to your question:\n\n" +
                            "❓ Your Question:\n" + question + "\n\n" +
                            "✅ Answer:\n" + answer + "\n\n" +
                            "If you have more questions, visit us at http://localhost:5173/faq\n\n" +
                            "Best regards,\n" +
                            "The CCTRS Team\n" +
                            "cctrsapp@gmail.com"
            );
            mailSender.send(message);
            logger.info("Question answer email sent to: {}", toEmail);
        } catch (MailException e) {
            logger.error("Failed to send question answer email to: {}. Error: {}", toEmail, e.getMessage(), e);
        }
    }

}