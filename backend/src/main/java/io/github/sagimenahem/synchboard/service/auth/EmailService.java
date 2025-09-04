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

@Service
@RequiredArgsConstructor
public class EmailService {

    private final TemplateEngine templateEngine;
    private final MessageSource messageSource;

    @Value("${sendgrid.api-key}")
    private String sendGridApiKey;

    @Value("${sendgrid.from-email:noreply@synchboard.com}")
    private String fromEmail;

    @Value("${sendgrid.from-name:SynchBoard Team}")
    private String fromName;

    @Value("${email.verification.expiry-minutes:15}")
    private int verificationExpiryMinutes;

    @Value("${email.password-reset.expiry-hours:1}")
    private int passwordResetExpiryHours;

    public boolean sendVerificationCode(String toEmail, String verificationCode) {
        return sendVerificationCode(toEmail, verificationCode, Locale.ENGLISH);
    }

    public boolean sendVerificationCode(String toEmail, String verificationCode, Locale locale) {
        String subject = messageSource.getMessage("email.verification.subject", null, locale);
        String body = buildVerificationEmailBody(verificationCode, locale);
        return sendEmail(toEmail, subject, body);
    }

    public boolean sendPasswordResetCode(String toEmail, String resetCode) {
        return sendPasswordResetCode(toEmail, resetCode, Locale.ENGLISH);
    }

    public boolean sendPasswordResetCode(String toEmail, String resetCode, Locale locale) {
        String subject = messageSource.getMessage("email.passwordReset.subject", null, locale);
        String body = buildPasswordResetEmailBody(resetCode, locale);
        return sendEmail(toEmail, subject, body);
    }

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

            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                return true;
            } else {
                return false;
            }
        } catch (IOException ex) {
            return false;
        }
    }

    private String buildVerificationEmailBody(String verificationCode, Locale locale) {
        Context context = new Context(locale);
        context.setVariable("verificationCode", verificationCode);
        context.setVariable("expiryMinutes", verificationExpiryMinutes);
        return templateEngine.process("email/verification", context);
    }

    private String buildPasswordResetEmailBody(String resetCode, Locale locale) {
        Context context = new Context(locale);
        context.setVariable("resetCode", resetCode);
        context.setVariable("expiryHours", passwordResetExpiryHours);
        return templateEngine.process("email/password-reset", context);
    }

    public String generateVerificationCode() {
        return String.format("%06d", (int) (Math.random() * 1000000));
    }
}
