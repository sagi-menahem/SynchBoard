package io.github.sagimenahem.synchboard.validation;

import static io.github.sagimenahem.synchboard.constants.MessageConstants.ERROR_EMAIL_CANT_BE_EMPTY;
import static io.github.sagimenahem.synchboard.constants.MessageConstants.ERROR_EMAIL_SHOULD_BE_VALID;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.lang.annotation.*;

/**
 * Custom validation annotation for email fields in the SynchBoard application.
 * 
 * <p>
 * This composite annotation combines multiple validation constraints to ensure that email fields
 * are both present and properly formatted. It leverages Jakarta Bean Validation (JSR-380) to
 * provide comprehensive email validation.
 * </p>
 * 
 * <p>
 * The annotation enforces the following validation rules:
 * </p>
 * <ul>
 * <li><strong>Non-blank:</strong> The email field cannot be null, empty, or contain only
 * whitespace</li>
 * <li><strong>Email format:</strong> The email must conform to standard email format patterns</li>
 * </ul>
 * 
 * <p>
 * This annotation is commonly used on DTO fields that accept email addresses, such as:
 * </p>
 * <ul>
 * <li>{@code LoginRequest.email} - User login authentication</li>
 * <li>{@code RegisterRequest.email} - New user registration</li>
 * <li>{@code InviteRequest.email} - Board member invitations</li>
 * </ul>
 * 
 * <p>
 * Error messages are externalized using message constants and support internationalization through
 * Spring's message source mechanism.
 * </p>
 * 
 * <p>
 * Usage example:
 * </p>
 * 
 * <pre>
 * public class LoginRequest {
 *     &#64;ValidEmail
 *     private String email;
 * 
 *     // ... other fields and methods
 * }
 * </pre>
 * 
 * @author Sagi Menahem
 * @see jakarta.validation.constraints.Email
 * @see jakarta.validation.constraints.NotBlank
 * @see io.github.sagimenahem.synchboard.constants.MessageConstants
 * @since 1.0
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@NotBlank(message = ERROR_EMAIL_CANT_BE_EMPTY)
@Email(message = ERROR_EMAIL_SHOULD_BE_VALID)
@Constraint(validatedBy = {})
public @interface ValidEmail {

    /**
     * The default error message when email validation fails.
     * 
     * <p>
     * This message is used when the email format validation fails. The message key references a
     * constant that supports localization through message properties files.
     * </p>
     * 
     * @return the default validation error message key
     */
    String message() default ERROR_EMAIL_SHOULD_BE_VALID;

    /**
     * Validation groups for conditional validation scenarios.
     * 
     * <p>
     * Groups allow for different validation rules to be applied in different contexts (e.g.,
     * creation vs. update operations). By default, no specific groups are assigned.
     * </p>
     * 
     * @return an array of validation group classes
     */
    Class<?>[] groups() default {};

    /**
     * Payload for carrying metadata about the validation.
     * 
     * <p>
     * Payloads can be used to associate metadata with validation constraints, such as severity
     * levels or custom processing hints. This is typically used by validation frameworks and
     * processors.
     * </p>
     * 
     * @return an array of payload classes
     */
    Class<? extends Payload>[] payload() default {};
}
