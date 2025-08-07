package io.github.sagimenahem.synchboard.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import io.github.sagimenahem.synchboard.config.AppProperties;
import io.github.sagimenahem.synchboard.config.constants.FileConstants;
import io.github.sagimenahem.synchboard.exception.InvalidRequestException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final AppProperties appProperties;
    private Path rootLocation;

    private static final Map<String, byte[]> FILE_SIGNATURES = new HashMap<>();
    static {
        FILE_SIGNATURES.put("image/jpeg", new byte[] {(byte) 0xFF, (byte) 0xD8});
        FILE_SIGNATURES.put("image/png",
                new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A});
        FILE_SIGNATURES.put("image/gif", new byte[] {0x47, 0x49, 0x46, 0x38});
        FILE_SIGNATURES.put("image/webp", new byte[] {0x52, 0x49, 0x46, 0x46});
    }

    @PostConstruct
    public void init() {
        try {
            String uploadDir = appProperties.getUpload().getDir();
            rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

            if (!Files.exists(rootLocation)) {
                Files.createDirectories(rootLocation);
                log.info("Created upload directory: {}", rootLocation);
            } else {
                log.info("Upload directory initialized: {}", rootLocation);
            }
        } catch (IOException e) {
            log.error("Failed to initialize storage location", e);
            throw new RuntimeException("Could not initialize storage location", e);
        }
    }

    public String store(MultipartFile file) {
        if (file.isEmpty()) {
            throw new InvalidRequestException(FileConstants.ERROR_EMPTY_FILE);
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new InvalidRequestException(FileConstants.ERROR_NO_FILENAME);
        }

        String contentType = file.getContentType();
        long fileSize = file.getSize();
        log.info("Processing file upload: {} ({}), Size: {} bytes", originalFilename, contentType,
                fileSize);

        String cleanedFilename = StringUtils.cleanPath(originalFilename);
        if (cleanedFilename.contains("..")) {
            log.error("Invalid path in filename: {}", cleanedFilename);
            throw new InvalidRequestException(FileConstants.ERROR_INVALID_PATH);
        }

        if (fileSize > FileConstants.MAX_FILE_SIZE_BYTES) {
            log.warn("File size {} exceeds maximum allowed size of {} bytes", fileSize,
                    FileConstants.MAX_FILE_SIZE_BYTES);
            throw new InvalidRequestException(String.format(FileConstants.ERROR_FILE_TOO_LARGE,
                    FileConstants.MAX_FILE_SIZE_MB));
        }

        if (!isAllowedMimeType(contentType)) {
            log.warn("MIME type validation failed. Content-Type: {}, Allowed types: {}",
                    contentType, String.join(", ", FileConstants.ALLOWED_IMAGE_MIME_TYPES));
            throw new InvalidRequestException(
                    String.format(FileConstants.ERROR_MIME_TYPE_NOT_ALLOWED,
                            String.join(", ", FileConstants.ALLOWED_IMAGE_MIME_TYPES)));
        }

        String fileExtension = getFileExtension(cleanedFilename);

        if (!isAllowedExtension(fileExtension)) {
            log.warn("File extension validation failed. Extension: '{}', Allowed extensions: {}",
                    fileExtension, String.join(", ", FileConstants.ALLOWED_IMAGE_EXTENSIONS));
            throw new InvalidRequestException(
                    String.format(FileConstants.ERROR_EXTENSION_NOT_ALLOWED,
                            String.join(", ", FileConstants.ALLOWED_IMAGE_EXTENSIONS)));
        }

        String normalizedContentType =
                contentType != null ? normalizeMimeType(contentType.toLowerCase()) : null;
        if (!validateFileSignature(file, normalizedContentType)) {
            log.warn(
                    "File signature validation failed for file: {} with Content-Type: {} (normalized: {})",
                    originalFilename, contentType, normalizedContentType);
            throw new InvalidRequestException(FileConstants.ERROR_FILE_SIGNATURE_MISMATCH);
        }

        if ("image/svg+xml".equals(normalizedContentType)) {
            if (!validateSvgSecurity(file)) {
                throw new InvalidRequestException(FileConstants.ERROR_SVG_MALICIOUS_CONTENT);
            }
        }

        String uniqueFilename = generateUniqueFilename(fileExtension);

        try (InputStream inputStream = file.getInputStream()) {
            Path destinationFile = this.rootLocation.resolve(uniqueFilename).normalize();

            if (!destinationFile.startsWith(this.rootLocation)) {
                log.error("Security check failed - destination outside upload directory: {}",
                        destinationFile);
                throw new InvalidRequestException(FileConstants.ERROR_STORAGE_OUTSIDE_DIRECTORY);
            }

            Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);

            log.info("File uploaded successfully: {} -> {}", originalFilename, uniqueFilename);
            return uniqueFilename;

        } catch (IOException e) {
            log.error("Failed to store file: {}", originalFilename, e);
            throw new RuntimeException(FileConstants.ERROR_FILE_STORAGE_FAILED, e);
        }
    }

    public void delete(String filename) {
        if (filename == null || filename.isBlank()) {
            return;
        }

        String cleanedFilename = StringUtils.cleanPath(filename);
        if (cleanedFilename.contains("..")) {
            log.warn("Attempted to delete file with invalid path: {}", filename);
            return;
        }

        try {
            Path file = rootLocation.resolve(cleanedFilename).normalize();

            if (!file.startsWith(this.rootLocation)) {
                log.warn("Attempted to delete file outside of upload directory: {}", filename);
                return;
            }

            if (Files.deleteIfExists(file)) {
                log.info("Successfully deleted file: {}", filename);
            } else {
                log.debug("File not found for deletion: {}", filename);
            }
        } catch (IOException e) {
            log.error("Failed to delete file: {}", filename, e);
        }
    }

    private boolean isAllowedMimeType(String mimeType) {
        if (mimeType == null) {
            return false;
        }

        String normalizedMimeType = normalizeMimeType(mimeType.toLowerCase());
        return FileConstants.ALLOWED_IMAGE_MIME_TYPES.contains(normalizedMimeType);
    }

    private String normalizeMimeType(String mimeType) {
        if ("image/jpg".equals(mimeType)) {
            return "image/jpeg";
        }
        return mimeType;
    }

    private boolean isAllowedExtension(String extension) {
        return extension != null
                && FileConstants.ALLOWED_IMAGE_EXTENSIONS.contains(extension.toLowerCase());
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".")).toLowerCase();
    }

    private String generateUniqueFilename(String extension) {
        return UUID.randomUUID().toString() + extension;
    }

    private boolean validateFileSignature(MultipartFile file, String declaredMimeType) {
        if ("image/svg+xml".equals(declaredMimeType)) {
            return true;
        }

        byte[] expectedSignature = FILE_SIGNATURES.get(declaredMimeType);
        if (expectedSignature == null) {
            log.debug("No signature validation available for MIME type: {}", declaredMimeType);
            return true;
        }

        try (InputStream is = file.getInputStream()) {
            byte[] fileHeader = new byte[12];
            int bytesRead = is.read(fileHeader);

            if (bytesRead < expectedSignature.length) {
                log.debug("File too small to validate signature for MIME type: {}",
                        declaredMimeType);
                return false;
            }

            if ("image/webp".equals(declaredMimeType)) {
                if (bytesRead >= 12) {
                    boolean isRiff = Arrays.equals(Arrays.copyOfRange(fileHeader, 0, 4),
                            new byte[] {0x52, 0x49, 0x46, 0x46});
                    if (isRiff) {
                        boolean hasWebpMarker = Arrays.equals(Arrays.copyOfRange(fileHeader, 8, 12),
                                new byte[] {0x57, 0x45, 0x42, 0x50});
                        return hasWebpMarker;
                    }
                }
                return false;
            }

            byte[] actualSignature = Arrays.copyOfRange(fileHeader, 0, expectedSignature.length);
            boolean isValid = Arrays.equals(actualSignature, expectedSignature);

            if (!isValid) {
                log.debug("File signature mismatch for MIME type {}: expected {} but got {}",
                        declaredMimeType, Arrays.toString(expectedSignature),
                        Arrays.toString(actualSignature));
            }

            return isValid;

        } catch (IOException e) {
            log.error("Error reading file signature for MIME type: {}", declaredMimeType, e);
            return false;
        }
    }

    private boolean validateSvgSecurity(MultipartFile file) {
        try {
            String content = new String(file.getBytes()).toLowerCase();

            for (String pattern : FileConstants.SVG_DANGEROUS_PATTERNS) {
                if (content.contains(pattern.toLowerCase())) {
                    log.warn("SVG file contains potentially dangerous content: {}", pattern);
                    return false;
                }
            }

            return true;

        } catch (IOException e) {
            log.error("Error validating SVG content", e);
            return false;
        }
    }
}
