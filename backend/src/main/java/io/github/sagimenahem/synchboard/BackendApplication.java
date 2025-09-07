package io.github.sagimenahem.synchboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import io.github.cdimascio.dotenv.Dotenv;
import io.github.sagimenahem.synchboard.config.AppProperties;

/**
 * Main Spring Boot application class for the SynchBoard collaborative whiteboard backend.
 * Configures and bootstraps the application with all necessary components including WebSocket
 * support, security configuration, and external service integrations.
 * 
 * @author Sagi Menahem
 */
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
            dotenv.entries().forEach(entry -> {
                System.setProperty(entry.getKey(), entry.getValue());
            });

            System.out.println(
                    "Loaded " + dotenv.entries().size() + " environment variables from .env file");

        } catch (Exception e) {
            System.err.println("Warning: Could not load .env file: " + e.getMessage());
        }
    }
}
