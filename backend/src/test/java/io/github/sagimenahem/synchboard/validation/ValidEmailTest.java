package io.github.sagimenahem.synchboard.validation;

import static org.assertj.core.api.Assertions.assertThat;

import io.github.sagimenahem.synchboard.dto.auth.LoginRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.util.Set;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

/**
 * Tests the composite {@link ValidEmail} constraint through {@link LoginRequest}, which is how it is
 * actually applied. Exercising the annotation via a real DTO catches the case where the composed
 * {@code @NotBlank}/{@code @Email} constraints stop being inherited.
 */
@DisplayName("@ValidEmail")
class ValidEmailTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void openValidator() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        factory.close();
    }

    private static Set<ConstraintViolation<LoginRequest>> validateEmail(String email) {
        LoginRequest request = LoginRequest.builder().email(email).password("correct-horse").build();
        return validator.validate(request);
    }

    @ParameterizedTest
    @ValueSource(strings = { "user@synchboard.com", "first.last@example.co.il", "user+tag@example.com" })
    @DisplayName("accepts well-formed addresses")
    void acceptsValidEmails(String email) {
        assertThat(validateEmail(email)).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = { "not-an-email", "user@", "@example.com", "user@@example.com" })
    @DisplayName("rejects malformed addresses")
    void rejectsMalformedEmails(String email) {
        assertThat(validateEmail(email)).isNotEmpty();
    }

    @Test
    @DisplayName("rejects a null address via the composed @NotBlank")
    void rejectsNull() {
        assertThat(validateEmail(null)).isNotEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = { "", "   " })
    @DisplayName("rejects blank addresses via the composed @NotBlank")
    void rejectsBlank(String email) {
        assertThat(validateEmail(email)).isNotEmpty();
    }

    @Test
    @DisplayName("still enforces the password constraint alongside the email one")
    void reportsBothFieldsIndependently() {
        LoginRequest request = LoginRequest.builder().email("not-an-email").password("").build();

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        assertThat(violations)
            .extracting((violation) -> violation.getPropertyPath().toString())
            .contains("email", "password");
    }
}
