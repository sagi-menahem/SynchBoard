package io.github.sagimenahem.synchboard;

import io.github.sagimenahem.synchboard.config.AppProperties;
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
        SpringApplication.run(BackendApplication.class, args);
    }
}
