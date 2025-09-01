package io.github.sagimenahem.synchboard.service.auth;

import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;

@Service
public class EmailService {


    @Value("${sendgrid.api-key}")
    private String sendGridApiKey;

    @Value("${sendgrid.from-email:noreply@synchboard.com}")
    private String fromEmail;

    @Value("${sendgrid.from-name:SynchBoard Team}")
    private String fromName;

    /**
     * Send email verification code
     */
    public boolean sendVerificationCode(String toEmail, String verificationCode) {
        String subject = "SynchBoard - Verify Your Email";
        String body = buildVerificationEmailBody(verificationCode);

        return sendEmail(toEmail, subject, body);
    }

    /**
     * Send password reset code
     */
    public boolean sendPasswordResetCode(String toEmail, String resetCode) {
        String subject = "SynchBoard - Password Reset";
        String body = buildPasswordResetEmailBody(resetCode);

        return sendEmail(toEmail, subject, body);
    }

    /**
     * Generic method to send email via SendGrid
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

            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                return true;
            } else {
                return false;
            }

        } catch (IOException ex) {
            return false;
        }
    }

    /**
     * Build verification email HTML content
     */
    private String buildVerificationEmailBody(String verificationCode) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .code { background-color: #1f2937; color: #f3f4f6; font-size: 28px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to SynchBoard!</h1>
                        </div>
                        <div class="content">
                            <h2>Verify Your Email Address</h2>
                            <p>Thank you for registering with SynchBoard. To complete your registration, please enter the verification code below:</p>

                            <div class="code">%s</div>

                            <p><strong>Important:</strong></p>
                            <ul>
                                <li>This code will expire in <strong>15 minutes</strong></li>
                                <li>Enter the code exactly as shown above</li>
                                <li>If you didn't request this, please ignore this email</li>
                            </ul>

                        </div>
                        <div class="footer">
                            <p>This is an automated message, please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(verificationCode);
    }

    /**
     * Build password reset email HTML content
     */
    private String buildPasswordResetEmailBody(String resetCode) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .code { background-color: #1f2937; color: #f3f4f6; font-size: 28px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .warning { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 4px; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Password Reset Request</h1>
                        </div>
                        <div class="content">
                            <h2>Reset Your Password</h2>
                            <p>You've requested to reset your SynchBoard password. Use the code below to proceed:</p>

                            <div class="code">%s</div>

                            <div class="warning">
                                <p><strong>Security Notice:</strong></p>
                                <ul>
                                    <li>This code will expire in <strong>1 hour</strong></li>
                                    <li>Only use this code if you requested a password reset</li>
                                    <li>Never share this code with anyone</li>
                                </ul>
                            </div>

                            <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>

                        </div>
                        <div class="footer">
                            <p>This is an automated message, please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(resetCode);
    }

    /**
     * Generate a random 6-digit verification code
     */
    public String generateVerificationCode() {
        return String.format("%06d", (int) (Math.random() * 1000000));
    }
}
