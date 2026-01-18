package io.github.sagimenahem.synchboard.service.auth;

import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Base64;
import java.util.Locale;
import java.util.Properties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

/**
 * Service for sending emails using Gmail REST API with OAuth2 authentication. Handles email
 * verification codes, password reset codes, and other transactional emails with internationalization
 * support.
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
     * Gmail API client (null if not configured or credentials are invalid)
     */
    @Nullable
    @Autowired(required = false)
    private Gmail gmail;

    /**
     * Sender email address for Gmail API
     */
    @Value("${GMAIL_SENDER_EMAIL:}")
    private String senderEmail;

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
     * Special user identifier for Gmail API (authenticated user)
     */
    private static final String GMAIL_USER_ME = "me";

    /**
     * Checks if email functionality is enabled by verifying the Gmail API client is configured.
     *
     * @return true if Gmail API client is available, false otherwise
     */
    public boolean isEmailEnabled() {
        return gmail != null && isNotEmpty(senderEmail);
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
            log.warn("Email service disabled - Gmail API not configured. Skipping verification email to: {}", toEmail);
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
                "Email service disabled - Gmail API not configured. Skipping password reset email to: {}",
                toEmail
            );
            return false;
        }
        String subject = messageSource.getMessage("email.passwordReset.subject", null, locale);
        String body = buildPasswordResetEmailBody(resetCode, locale);
        return sendEmail(toEmail, subject, body);
    }

    /**
     * Sends an email using the Gmail REST API.
     *
     * @param toEmail the recipient's email address
     * @param subject the email subject
     * @param body the HTML email body
     * @return true if the email was sent successfully, false otherwise
     */
    private boolean sendEmail(String toEmail, String subject, String body) {
        try {
            MimeMessage mimeMessage = createMimeMessage(toEmail, subject, body);
            Message gmailMessage = createGmailMessage(mimeMessage);

            gmail.users().messages().send(GMAIL_USER_ME, gmailMessage).execute();
            log.info("Email sent successfully via Gmail API to: {}", toEmail);
            return true;
        } catch (MessagingException | IOException e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
            return false;
        }
    }

    /**
     * Creates a MimeMessage for the email.
     *
     * @param toEmail the recipient's email address
     * @param subject the email subject
     * @param body the HTML email body
     * @return the constructed MimeMessage
     * @throws MessagingException if message creation fails
     * @throws UnsupportedEncodingException if encoding fails
     */
    private MimeMessage createMimeMessage(String toEmail, String subject, String body)
        throws MessagingException, UnsupportedEncodingException {
        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);

        MimeMessage message = new MimeMessage(session);
        message.setFrom(new InternetAddress(senderEmail, fromName));
        message.addRecipient(jakarta.mail.Message.RecipientType.TO, new InternetAddress(toEmail));
        message.setSubject(subject, "UTF-8");
        message.setContent(body, "text/html; charset=UTF-8");

        return message;
    }

    /**
     * Creates a Gmail API Message from a MimeMessage.
     *
     * @param mimeMessage the MimeMessage to convert
     * @return the Gmail API Message
     * @throws MessagingException if conversion fails
     * @throws IOException if encoding fails
     */
    private Message createGmailMessage(MimeMessage mimeMessage) throws MessagingException, IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        mimeMessage.writeTo(buffer);
        byte[] bytes = buffer.toByteArray();
        String encodedEmail = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        Message message = new Message();
        message.setRaw(encodedEmail);
        return message;
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

    /**
     * Helper method to check if a string is not null and not empty.
     *
     * @param value the string to check
     * @return true if the string is not null and not empty after trimming
     */
    private boolean isNotEmpty(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
