package io.github.sagimenahem.synchboard.util;

import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Helper utility for formatting messages with parameters.
 * Maintains backward compatibility while providing proper message formatting.
 */
@Component
public class MessageHelper {

    /**
     * Formats a message key with parameter by simple concatenation (for backward compatibility).
     * This is used for error messages that expect "prefix: value" format.
     */
    public static String formatMessage(String messageKey, String parameter) {
        return messageKey + ": " + parameter;
    }
    
    /**
     * Formats a message with parameters using MessageSource (for proper i18n).
     * This would be used when proper localization is needed.
     */
    public String formatLocalizedMessage(MessageSource messageSource, String messageKey, 
                                       Locale locale, Object... parameters) {
        return messageSource.getMessage(messageKey, parameters, locale);
    }
}