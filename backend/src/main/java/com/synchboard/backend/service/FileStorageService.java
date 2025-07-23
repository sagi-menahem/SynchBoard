// File: backend/src/main/java/com/synchboard/backend/service/FileStorageService.java
package com.synchboard.backend.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.synchboard.backend.config.AppProperties;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final AppProperties appProperties;
    private Path rootLocation;

    @PostConstruct
    public void init() {
        try {
            rootLocation = Paths.get(appProperties.getUpload().getDir());
            if (!Files.exists(rootLocation)) {
                Files.createDirectories(rootLocation);
                System.out.println("Created upload directory: " + rootLocation.toAbsolutePath());
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage location", e);
        }
    }

    public String store(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();

        if (file.isEmpty() || originalFilename == null) {
            throw new RuntimeException("Failed to store empty file or file with no name.");
        }

        String cleanedFilename = StringUtils.cleanPath(originalFilename);
        String fileExtension = "";
        try {
            fileExtension = cleanedFilename.substring(cleanedFilename.lastIndexOf("."));
        } catch (Exception e) {
        }

        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

        try (InputStream inputStream = file.getInputStream()) {
            Path destinationFile = this.rootLocation.resolve(uniqueFilename).normalize().toAbsolutePath();

            Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);

            return uniqueFilename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }

    public void delete(String filename) {
        if (filename == null || filename.isBlank()) {
            return;
        }
        try {
            Path file = rootLocation.resolve(filename);
            Files.deleteIfExists(file);
        } catch (IOException e) {
            System.err.println("Failed to delete file: " + filename);
        }
    }
}