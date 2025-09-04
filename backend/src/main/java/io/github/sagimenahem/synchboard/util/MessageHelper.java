package io.github.sagimenahem.synchboard.util;

import java.util.Locale;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

/**
 * Utility class for formatting and localizing messages throughout the SynchBoard application.
 * 
 * <p>
 * This helper class provides methods to format messages with parameters and retrieve localized
 * messages using Spring's MessageSource. It supports both simple parameter substitution and full
 * internationalization (i18n) capabilities.
 * </p>
 * 
 * <p>
 * The class is designed to work with the application's message properties files and provides a
 * consistent way to handle user-facing messages, error messages, and notifications across the
 * application.
 * </p>
 * 
 * <p>
 * Usage examples:
 * </p>
 * 
 * <pre>
 * // Simple message formatting
 * String message = MessageHelper.formatMessage("user.error", "Invalid input");
 * 
 * // Localized message retrieval
 * MessageHelper helper = new MessageHelper();
 * String localizedMessage =
 *         helper.formatLocalizedMessage(messageSource, "welcome.message", Locale.US, "John Doe");
 * </pre>
 * 
 * @author Sagi Menahem
 * @see org.springframework.context.MessageSource
 * @see java.util.Locale
 */
@Component
public class MessageHelper {

    /**
     * Formats a simple message by concatenating a message key with a parameter.
     * 
     * <p>
     * This method provides basic message formatting by combining a message key with a single
     * parameter using a colon separator. It's useful for creating consistent error messages or
     * debug information.
     * </p>
     * 
     * @param messageKey the message key or identifier (must not be null)
     * @param parameter the parameter to append to the message key (must not be null)
     * @return a formatted string in the format "messageKey: parameter"
     * @throws NullPointerException if messageKey or parameter is null
     */
    public static String formatMessage(String messageKey, String parameter) {
        return messageKey + ": " + parameter;
    }

    /**
     * Retrieves and formats a localized message using Spring's MessageSource.
     * 
     * <p>
     * This method leverages Spring's internationalization (i18n) support to retrieve localized
     * messages from property files based on the specified locale. It supports parameter
     * substitution using MessageSource's parameter replacement mechanism.
     * </p>
     * 
     * <p>
     * The method is commonly used throughout the application for:
     * </p>
     * <ul>
     * <li>User-facing error messages</li>
     * <li>Success notifications</li>
     * <li>Dynamic content based on user locale</li>
     * <li>Email template content</li>
     * </ul>
     * 
     * @param messageSource the Spring MessageSource to retrieve messages from (must not be null)
     * @param messageKey the key to look up in the message properties (must not be null)
     * @param locale the locale for message localization (must not be null)
     * @param parameters optional parameters for message substitution (can be null or empty)
     * @return the localized and formatted message string
     * @throws org.springframework.context.NoSuchMessageException if the message key is not found
     * @throws NullPointerException if messageSource, messageKey, or locale is null
     */
    public String formatLocalizedMessage(MessageSource messageSource, String messageKey,
            Locale locale, Object... parameters) {
        return messageSource.getMessage(messageKey, parameters, locale);
    }
}
