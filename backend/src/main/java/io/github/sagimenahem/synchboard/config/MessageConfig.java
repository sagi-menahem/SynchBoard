package io.github.sagimenahem.synchboard.config;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;

/**
 * Configuration class for internationalization message source. Sets up message source for localized
 * messages used in email templates and other internationalized content throughout the application.
 *
 * @author Sagi Menahem
 */
@Configuration
public class MessageConfig {

    /**
     * Creates a MessageSource bean for internationalization support. Configures a reloadable
     * resource bundle message source with UTF-8 encoding and caching for performance optimization.
     *
     * @return MessageSource configured for the application's i18n needs
     */
    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
        messageSource.setBasename("classpath:messages");
        messageSource.setDefaultEncoding("UTF-8");
        messageSource.setCacheSeconds(3600);
        return messageSource;
    }
}
