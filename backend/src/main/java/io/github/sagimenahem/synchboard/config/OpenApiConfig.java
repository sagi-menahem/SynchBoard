package io.github.sagimenahem.synchboard.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for OpenAPI/Swagger documentation. Sets up Swagger UI documentation with JWT
 * bearer token authentication for the SynchBoard REST API endpoints.
 * 
 * @author Sagi Menahem
 */
@Configuration
public class OpenApiConfig {

    /**
     * Creates a customized OpenAPI specification for the SynchBoard API. Configures API metadata,
     * security requirements, and JWT bearer authentication.
     * 
     * @return OpenAPI specification configured for the application
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("SynchBoard API").version("1.0.0")
                        .description("Real-time collaborative whiteboard application API")
                        .contact(new Contact().name("SynchBoard Team")
                                .email("support@synchboard.com")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components().addSecuritySchemes("bearerAuth", new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")));
    }
}
