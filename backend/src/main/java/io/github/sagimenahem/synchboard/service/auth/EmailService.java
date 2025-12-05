package io.github.sagimenahem.synchboard.service.auth;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

/**
 * Service for sending emails using Gmail SMTP. Handles email verification codes, password reset
 * codes, and other transactional emails with internationalization support.
 *
 * @author Sagi Menahem
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    /**
     * Thymeleaf template engine for rendering email templates
     */
    private final TemplateEngine templateEngine;

    /**
     * Message source for internationalization
     */
    private final MessageSource messageSource;

    /**
     * Spring Mail sender for SMTP email delivery
     */
    private final JavaMailSender mailSender;

    /**
     * SMTP username (email address used for sending)
     */
    @Value("${spring.mail.username:}")
    private String mailUsername;

    /**
     * SMTP password (Gmail App Password)
     */
    @Value("${spring.mail.password:}")
    private String mailPassword;

    /**
     * Sender display name
     */
    @Value("${MAIL_FROM_NAME:SynchBoard Team}")
    private String fromName;

    /**
     * Email verification code expiry time in minutes
     */
    @Value("${VERIFICATION_EXPIRY_MINUTES:15}")
    private int verificationExpiryMinutes;

    /**
     * Password reset code expiry time in hours
     */
    @Value("${PASSWORD_RESET_EXPIRY_MINUTES:60}")
    private int passwordResetExpiryMinutes;

    /**
     * Checks if email functionality is enabled by verifying the SMTP password is configured.
     *
     * @return true if SMTP password is available and not empty, false otherwise
     */
    public boolean isEmailEnabled() {
        return mailPassword != null && !mailPassword.trim().isEmpty();
    }

    /**
     * Sends an email verification code using the default locale (English).
     *
     * @param toEmail the recipient's email address
     * @param verificationCode the 6-digit verification code
     * @return true if the email was sent successfully, false otherwise
     */
    public boolean sendVerificationCode(String toEmail, String verificationCode) {
        return sendVerificationCode(toEmail, verificationCode, Locale.ENGLISH);
    }

    /**
     * Sends an email verification code with localized content.
     *
     * @param toEmail the recipient's email address
     * @param verificationCode the 6-digit verification code
     * @param locale the locale for email content
     * @return true if the email was sent successfully, false otherwise
     */
    public boolean sendVerificationCode(String toEmail, String verificationCode, Locale locale) {
        if (!isEmailEnabled()) {
            log.warn(
                "Email service disabled - SMTP password not configured. Skipping verification email to: {}",
                toEmail
            );
            return false;
        }
        String subject = messageSource.getMessage("email.verification.subject", null, locale);
        String body = buildVerificationEmailBody(verificationCode, locale);
        return sendEmail(toEmail, subject, body);
    }

    /**
     * Sends a password reset code using the default locale (English).
     *
     * @param toEmail the recipient's email address
     * @param resetCode the password reset code
     * @return true if the email was sent successfully, false otherwise
     */
    public boolean sendPasswordResetCode(String toEmail, String resetCode) {
        return sendPasswordResetCode(toEmail, resetCode, Locale.ENGLISH);
    }

    /**
     * Sends a password reset code with localized content.
     *
     * @param toEmail the recipient's email address
     * @param resetCode the password reset code
     * @param locale the locale for email content
     * @return true if the email was sent successfully, false otherwise
     */
    public boolean sendPasswordResetCode(String toEmail, String resetCode, Locale locale) {
        if (!isEmailEnabled()) {
            log.warn(
                "Email service disabled - SMTP password not configured. Skipping password reset email to: {}",
                toEmail
            );
            return false;
        }
        String subject = messageSource.getMessage("email.passwordReset.subject", null, locale);
        String body = buildPasswordResetEmailBody(resetCode, locale);
        return sendEmail(toEmail, subject, body);
    }

    /**
     * Sends an email using Spring JavaMailSender with SMTP.
     *
     * @param toEmail the recipient's email address
     * @param subject the email subject
     * @param body the HTML email body
     * @return true if the email was sent successfully, false otherwise
     */
    private boolean sendEmail(String toEmail, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(mailUsername, fromName);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body, true); // true = HTML content

            mailSender.send(message);
            log.info("Email sent successfully to: {}", toEmail);
            return true;
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
            return false;
        }
    }

    /**
     * Builds the HTML body for email verification emails using Thymeleaf templates.
     *
     * @param verificationCode the 6-digit verification code
     * @param locale the locale for template processing
     * @return the rendered HTML email body
     */
    private String buildVerificationEmailBody(String verificationCode, Locale locale) {
        Context context = new Context(locale);
        context.setVariable("verificationCode", verificationCode);
        context.setVariable("expiryMinutes", verificationExpiryMinutes);

        // Use locale-specific template if available
        String templateName = isHebrewLocale(locale) ? "email/verification_he" : "email/verification";
        return templateEngine.process(templateName, context);
    }

    /**
     * Builds the HTML body for password reset emails using Thymeleaf templates.
     *
     * @param resetCode the password reset code
     * @param locale the locale for template processing
     * @return the rendered HTML email body
     */
    private String buildPasswordResetEmailBody(String resetCode, Locale locale) {
        Context context = new Context(locale);
        context.setVariable("resetCode", resetCode);
        context.setVariable("expiryMinutes", passwordResetExpiryMinutes);

        // Use locale-specific template if available
        String templateName = isHebrewLocale(locale) ? "email/password-reset_he" : "email/password-reset";
        return templateEngine.process(templateName, context);
    }

    /**
     * Checks if the given locale is Hebrew.
     *
     * @param locale the locale to check
     * @return true if the locale is Hebrew, false otherwise
     */
    private boolean isHebrewLocale(Locale locale) {
        return locale != null && "he".equals(locale.getLanguage());
    }

    /**
     * Generates a random 6-digit verification code.
     *
     * @return a 6-digit numerical verification code as a string
     */
    public String generateVerificationCode() {
        // Generate random 6-digit code: Math.random() * 1000000 produces 0-999999
        // %06d format ensures leading zeros for codes less than 100000 (e.g., "000123")
        return String.format("%06d", (int) (Math.random() * 1000000));
    }
}
