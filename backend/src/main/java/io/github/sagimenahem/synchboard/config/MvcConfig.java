package io.github.sagimenahem.synchboard.config;

import java.nio.file.Path;
import java.nio.file.Paths;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Spring MVC configuration class for static resource handling. Configures static file serving for
 * uploaded images and other resources. Exposes upload directories as web-accessible resources.
 * 
 * @author Sagi Menahem
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class MvcConfig implements WebMvcConfigurer {

    /** Application configuration properties */
    private final AppProperties appProperties;

    /**
     * Configures resource handlers for serving static files. Exposes the upload directory as
     * web-accessible resources.
     * 
     * @param registry The resource handler registry to configure
     */
    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        exposeDirectory("images", appProperties.getUpload().getDir(), registry);
    }

    /**
     * Exposes a physical directory as a web-accessible resource path. Converts physical file system
     * paths to web URLs for static resource serving.
     * 
     * @param urlPath The URL path pattern for web access
     * @param physicalPath The physical file system directory path
     * @param registry The resource handler registry to register with
     */
    private void exposeDirectory(String urlPath, String physicalPath,
            ResourceHandlerRegistry registry) {
        Path absolutePath = Paths.get(physicalPath).toAbsolutePath();
        String location = "file:///" + absolutePath.toString().replace("\\", "/") + "/";

        registry.addResourceHandler("/" + urlPath + "/**").addResourceLocations(location);

        log.info("Exposing directory: {} at {}", urlPath, location);
    }
}
