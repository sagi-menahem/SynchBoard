package io.github.sagimenahem.synchboard.util;

import java.util.Locale;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

@Component
public class MessageHelper {

    public static String formatMessage(String messageKey, String parameter) {
        return messageKey + ": " + parameter;
    }

    public String formatLocalizedMessage(MessageSource messageSource, String messageKey,
            Locale locale, Object... parameters) {
        return messageSource.getMessage(messageKey, parameters, locale);
    }
}
