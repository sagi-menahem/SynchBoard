package io.github.sagimenahem.synchboard.config;

import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class MvcConfig implements WebMvcConfigurer {

    private final AppProperties appProperties;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        exposeDirectory("images", appProperties.getUpload().getDir(), registry);
    }

    private void exposeDirectory(String urlPath, String physicalPath,
            ResourceHandlerRegistry registry) {
        Path absolutePath = Paths.get(physicalPath).toAbsolutePath();
        String location = "file:///" + absolutePath.toString().replace("\\", "/") + "/";

        registry.addResourceHandler("/" + urlPath + "/**").addResourceLocations(location);

        System.out.println("Exposing directory: " + urlPath + " at " + location);
    }
}
