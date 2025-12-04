package io.github.sagimenahem.synchboard;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.sagimenahem.synchboard.config.AppProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

/**
 * Main Spring Boot application class for the SynchBoard collaborative whiteboard backend.
 * Configures and bootstraps the application with all necessary components including WebSocket
 * support, security configuration, and external service integrations.
 *
 * @author Sagi Menahem
 */
@Slf4j
@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class BackendApplication {

    /**
     * Main method to start the SynchBoard backend application. Initializes Spring Boot context and
     * starts the embedded Tomcat server.
     *
     * @param args command line arguments passed to the application
     */
    public static void main(String[] args) {
        // Load .env file before starting Spring Boot
        loadEnvironmentVariables();

        SpringApplication.run(BackendApplication.class, args);
    }

    /**
     * Loads environment variables from .env file in the current directory. Sets system properties
     * so Spring Boot can access them via ${...} placeholders.
     */
    private static void loadEnvironmentVariables() {
        try {
            Dotenv dotenv = Dotenv.configure().directory(".").ignoreIfMissing().load();

            // Set as system properties so Spring can access them
            dotenv
                .entries()
                .forEach((entry) -> {
                    System.setProperty(entry.getKey(), entry.getValue());
                });

            log.info("Loaded {} environment variables from .env file", dotenv.entries().size());
        } catch (Exception e) {
            log.warn("Could not load .env file: {}", e.getMessage());
        }
    }
}
