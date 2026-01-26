package com.cctrs.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    public void sendApprovalEmail(String toEmail, String activityName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("CCTRS Activity Approved 🌱");
            message.setText(
                    "Your activity '" + activityName + "' has been approved. Points have been added to your account.");
            mailSender.send(message);
            logger.info("Approval email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send approval email to: {}. Error: {}", toEmail, e.getMessage());
        }
    }

    public void sendRejectionEmail(String toEmail, String activityName) {
        sendRejectionEmailWithReason(toEmail, activityName, null);
    }

    public void sendRejectionEmailWithReason(String toEmail, String activityName, String reason) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
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
        } catch (Exception e) {
            logger.error("Failed to send rejection email to: {}. Error: {}", toEmail, e.getMessage());
        }
    }

    public void sendVerificationEmail(String toEmail, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("CCTRS Email Verification");
            message.setText(
                    "Please verify your email by clicking the link: http://localhost:8080/auth/verify?token=" + token);
            mailSender.send(message);
            logger.info("Verification email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send verification email to: {}. Error: {}", toEmail, e.getMessage());
        }
    }
}
