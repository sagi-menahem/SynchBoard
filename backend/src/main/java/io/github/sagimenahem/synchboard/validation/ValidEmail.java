package io.github.sagimenahem.synchboard.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import static io.github.sagimenahem.synchboard.constants.MessageConstants.ERROR_EMAIL_CANT_BE_EMPTY;
import static io.github.sagimenahem.synchboard.constants.MessageConstants.ERROR_EMAIL_SHOULD_BE_VALID;

/**
 * Composite validation annotation that combines @NotBlank and @Email
 * with consistent error messaging using MessageConstants.
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@NotBlank(message = ERROR_EMAIL_CANT_BE_EMPTY)
@Email(message = ERROR_EMAIL_SHOULD_BE_VALID)
@Constraint(validatedBy = {})
public @interface ValidEmail {
    String message() default ERROR_EMAIL_SHOULD_BE_VALID;
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}