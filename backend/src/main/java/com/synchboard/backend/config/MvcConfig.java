// File: backend/src/main/java/com/synchboard/backend/config/MvcConfig.java
package com.synchboard.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.lang.NonNull;
import lombok.RequiredArgsConstructor;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@RequiredArgsConstructor
public class MvcConfig implements WebMvcConfigurer {

    private final AppProperties appProperties;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Expose the 'uploads' directory to be accessible via the "/images/**" URL path
        exposeDirectory("images", appProperties.getUpload().getDir(), registry);
    }

    private void exposeDirectory(String urlPath, String physicalPath, ResourceHandlerRegistry registry) {
        Path absolutePath = Paths.get(physicalPath).toAbsolutePath();
        String location = "file:///" + absolutePath.toString().replace("\\", "/") + "/";

        registry.addResourceHandler("/" + urlPath + "/**")
                .addResourceLocations(location);

        // TODO
        System.out.println("Exposing directory: " + urlPath + " at " + location);
    }
}