package io.github.sagimenahem.synchboard.service.auth;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import java.io.IOException;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

/**
 * Service for sending emails using SendGrid API. Handles email verification codes, password reset
 * codes, and other transactional emails with internationalization support.
 * 
 * @author Sagi Menahem
 */
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
     * SendGrid API key for authentication
     */
    @Value("${sendgrid.api-key}")
    private String sendGridApiKey;

    /**
     * Sender email address
     */
    @Value("${sendgrid.from-email:noreply@synchboard.com}")
    private String fromEmail;

    /**
     * Sender display name
     */
    @Value("${sendgrid.from-name:SynchBoard Team}")
    private String fromName;

    /**
     * Email verification code expiry time in minutes
     */
    @Value("${email.verification.expiry-minutes:15}")
    private int verificationExpiryMinutes;

    /**
     * Password reset code expiry time in hours
     */
    @Value("${email.password-reset.expiry-hours:1}")
    private int passwordResetExpiryHours;

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
        String subject = messageSource.getMessage("email.passwordReset.subject", null, locale);
        String body = buildPasswordResetEmailBody(resetCode, locale);
        return sendEmail(toEmail, subject, body);
    }

    /**
     * Sends an email using the SendGrid API.
     * 
     * @param toEmail the recipient's email address
     * @param subject the email subject
     * @param body the HTML email body
     * @return true if the email was sent successfully (2xx status code), false otherwise
     */
    private boolean sendEmail(String toEmail, String subject, String body) {
        try {
            Email from = new Email(fromEmail, fromName);
            Email to = new Email(toEmail);
            Content content = new Content("text/html", body);

            Mail mail = new Mail(from, subject, to, content);

            SendGrid sg = new SendGrid(sendGridApiKey);
            Request request = new Request();

            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);

            // Check if response status indicates success (2xx range)
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                return true;
            } else {
                return false;
            }
        } catch (IOException ex) {
            // Log the exception in a real application
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
        return templateEngine.process("email/verification", context);
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
        context.setVariable("expiryHours", passwordResetExpiryHours);
        return templateEngine.process("email/password-reset", context);
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
