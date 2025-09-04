package io.github.sagimenahem.synchboard.service.storage;

import static io.github.sagimenahem.synchboard.constants.ApiConstants.APPLICATION_VERSION;
import static io.github.sagimenahem.synchboard.constants.FileConstants.*;

import io.github.sagimenahem.synchboard.config.AppProperties;
import io.github.sagimenahem.synchboard.constants.LoggingConstants;
import io.github.sagimenahem.synchboard.exception.InvalidRequestException;
import jakarta.annotation.PostConstruct;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final AppProperties appProperties;
    private Path rootLocation;

    private static final Map<String, byte[]> FILE_SIGNATURES = new HashMap<>();

    static {
        FILE_SIGNATURES.put("image/jpeg", new byte[] { (byte) 0xFF, (byte) 0xD8 });
        FILE_SIGNATURES.put("image/png", new byte[] { (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A });
        FILE_SIGNATURES.put("image/gif", new byte[] { 0x47, 0x49, 0x46, 0x38 });
        FILE_SIGNATURES.put("image/webp", new byte[] { 0x52, 0x49, 0x46, 0x46 });
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
            throw new InvalidRequestException(ERROR_EMPTY_FILE);
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new InvalidRequestException(ERROR_NO_FILENAME);
        }

        String contentType = file.getContentType();
        long fileSize = file.getSize();
        log.info("Processing file upload: {} ({}), Size: {} bytes", originalFilename, contentType, fileSize);

        String cleanedFilename = StringUtils.cleanPath(originalFilename);
        String fileExtension = getFileExtension(cleanedFilename);
        String normalizedContentType = contentType != null ? normalizeMimeType(contentType.toLowerCase()) : null;

        validateUploadedFile(file, cleanedFilename, fileSize, normalizedContentType, fileExtension);

        String uniqueFilename = generateUniqueFilename(fileExtension);

        try (InputStream inputStream = file.getInputStream()) {
            Path destinationFile = securePathResolve(uniqueFilename, "store");
            if (destinationFile == null) {
                throw new InvalidRequestException(ERROR_STORAGE_OUTSIDE_DIRECTORY);
            }

            Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);

            log.info(LoggingConstants.FILE_UPLOAD_SUCCESS, uniqueFilename, "system");
            return "/images/" + uniqueFilename;
        } catch (IOException e) {
            log.error(LoggingConstants.FILE_UPLOAD_FAILED, originalFilename, "system", e.getMessage());
            throw new RuntimeException(ERROR_FILE_STORAGE_FAILED, e);
        }
    }

    public void delete(String filename) {
        if (filename == null || filename.isBlank()) {
            return;
        }

        String cleanedFilename = StringUtils.cleanPath(filename);
        Path file = securePathResolve(cleanedFilename, "delete");
        if (file == null) {
            return;
        }

        try {
            if (Files.deleteIfExists(file)) {
                log.info(LoggingConstants.FILE_DELETE_SUCCESS, filename, "system");
            } else {
                log.debug("File not found for deletion: {}", filename);
            }
        } catch (IOException e) {
            log.error(LoggingConstants.FILE_DELETE_FAILED, filename, e.getMessage());
            throw new RuntimeException("File deletion failed: " + filename, e);
        }
    }

    private String normalizeMimeType(String mimeType) {
        return "image/jpg".equals(mimeType) ? "image/jpeg" : mimeType;
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
        FileSignatureValidator validator = getFileSignatureValidator(declaredMimeType);
        return validator.validate(file);
    }

    private FileSignatureValidator getFileSignatureValidator(String mimeType) {
        switch (mimeType) {
            case "image/svg+xml":
                return new SvgSignatureValidator();
            case "image/webp":
                return new WebPSignatureValidator();
            default:
                return new StandardSignatureValidator(mimeType);
        }
    }

    private interface FileSignatureValidator {
        boolean validate(MultipartFile file);
    }

    private static class SvgSignatureValidator implements FileSignatureValidator {

        @Override
        public boolean validate(MultipartFile file) {
            return true;
        }
    }

    private static class WebPSignatureValidator implements FileSignatureValidator {

        @Override
        public boolean validate(MultipartFile file) {
            try (InputStream is = file.getInputStream()) {
                byte[] fileHeader = new byte[12];
                int bytesRead = is.read(fileHeader);

                if (bytesRead < 12) {
                    log.debug("File too small to validate WebP signature");
                    return false;
                }

                boolean isRiff = Arrays.equals(
                    Arrays.copyOfRange(fileHeader, 0, 4),
                    new byte[] { 0x52, 0x49, 0x46, 0x46 }
                );
                if (isRiff) {
                    boolean hasWebpMarker = Arrays.equals(
                        Arrays.copyOfRange(fileHeader, 8, 12),
                        new byte[] { 0x57, 0x45, 0x42, 0x50 }
                    );
                    return hasWebpMarker;
                }
                return false;
            } catch (IOException e) {
                log.error("Error validating WebP signature, rejecting file for security", e);
                return false;
            }
        }
    }

    private class StandardSignatureValidator implements FileSignatureValidator {

        private final String mimeType;

        public StandardSignatureValidator(String mimeType) {
            this.mimeType = mimeType;
        }

        @Override
        public boolean validate(MultipartFile file) {
            byte[] expectedSignature = FILE_SIGNATURES.get(mimeType);
            if (expectedSignature == null) {
                log.debug("No signature validation available for MIME type: {}", mimeType);
                return true;
            }

            try (InputStream is = file.getInputStream()) {
                byte[] fileHeader = new byte[expectedSignature.length];
                int bytesRead = is.read(fileHeader);

                if (bytesRead < expectedSignature.length) {
                    log.debug("File too small to validate signature for MIME type: {}", mimeType);
                    return false;
                }

                boolean isValid = Arrays.equals(fileHeader, expectedSignature);

                if (!isValid) {
                    log.debug(
                        "File signature mismatch for MIME type {}: expected {} but got {}",
                        mimeType,
                        Arrays.toString(expectedSignature),
                        Arrays.toString(fileHeader)
                    );
                }

                return isValid;
            } catch (IOException e) {
                log.error("Error reading file signature for MIME type: {}, rejecting file for security", mimeType, e);
                return false;
            }
        }
    }

    private boolean validateSvgSecurity(MultipartFile file) {
        try {
            String content = new String(file.getBytes()).toLowerCase();

            for (String pattern : SVG_DANGEROUS_PATTERNS) {
                if (content.contains(pattern.toLowerCase())) {
                    log.warn(
                        LoggingConstants.FILE_VALIDATION_FAILED,
                        "SVG file",
                        "Contains potentially dangerous content: " + pattern
                    );
                    return false;
                }
            }

            return true;
        } catch (IOException e) {
            log.error("Error validating SVG content, rejecting file for security", e);
            return false;
        }
    }

    public String downloadAndStoreImageFromUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            log.debug("No image URL provided");
            return null;
        }

        try {
            java.net.URI uri = java.net.URI.create(imageUrl);
            java.net.URL url = uri.toURL();
            java.net.URLConnection connection = url.openConnection();

            connection.setConnectTimeout(HTTP_CONNECTION_TIMEOUT_MS);
            connection.setReadTimeout(HTTP_READ_TIMEOUT_MS);
            connection.setRequestProperty("User-Agent", "SynchBoard/" + APPLICATION_VERSION);

            String contentType = connection.getContentType();
            if (contentType != null) {
                contentType = contentType.split(";")[0].toLowerCase().trim();
            }

            if (contentType == null || !FILE_SIGNATURES.containsKey(contentType)) {
                log.warn("Unsupported image content type from URL: {} - {}", imageUrl, contentType);
                return null;
            }

            String extension = getFileExtensionFromContentType(contentType);
            String uniqueFilename = generateUniqueFilename(extension);

            try (InputStream inputStream = connection.getInputStream()) {
                Path destinationFile = securePathResolve(uniqueFilename, "download");
                if (destinationFile == null) {
                    return null;
                }

                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);

                log.info("Successfully downloaded and stored image from URL: {} as {}", imageUrl, uniqueFilename);
                return "/images/" + uniqueFilename;
            }
        } catch (java.net.MalformedURLException | java.lang.IllegalArgumentException e) {
            log.warn("Invalid image URL: {}", imageUrl);
            return null;
        } catch (IOException e) {
            log.error("Failed to download image from URL: {} - {}", imageUrl, e.getMessage());
            return null;
        }
    }

    private String getFileExtensionFromContentType(String contentType) {
        switch (contentType) {
            case "image/jpeg":
                return ".jpg";
            case "image/png":
                return ".png";
            case "image/gif":
                return ".gif";
            case "image/webp":
                return ".webp";
            default:
                return ".jpg";
        }
    }

    private void validateUploadedFile(
        MultipartFile file,
        String cleanedFilename,
        long fileSize,
        String normalizedContentType,
        String fileExtension
    ) throws InvalidRequestException {
        if (cleanedFilename.contains("..")) {
            log.error("Invalid path in filename: {}", cleanedFilename);
            throw new InvalidRequestException(ERROR_INVALID_PATH);
        }

        if (fileSize > MAX_FILE_SIZE_BYTES) {
            log.warn(
                LoggingConstants.FILE_VALIDATION_FAILED,
                file.getOriginalFilename(),
                String.format("File size %d exceeds maximum allowed size", fileSize)
            );
            throw new InvalidRequestException(String.format(ERROR_FILE_TOO_LARGE, MAX_FILE_SIZE_MB));
        }

        if (!isValidMimeType(normalizedContentType)) {
            log.warn(
                LoggingConstants.FILE_VALIDATION_FAILED,
                file.getOriginalFilename(),
                "MIME type not allowed: " + normalizedContentType
            );
            throw new InvalidRequestException(
                String.format(ERROR_MIME_TYPE_NOT_ALLOWED, String.join(", ", ALLOWED_IMAGE_MIME_TYPES))
            );
        }

        if (!isValidExtension(fileExtension)) {
            log.warn(
                LoggingConstants.FILE_VALIDATION_FAILED,
                file.getOriginalFilename(),
                "File extension not allowed: " + fileExtension
            );
            throw new InvalidRequestException(
                String.format(ERROR_EXTENSION_NOT_ALLOWED, String.join(", ", ALLOWED_IMAGE_EXTENSIONS))
            );
        }

        if (!validateFileSignature(file, normalizedContentType)) {
            log.warn(
                LoggingConstants.FILE_VALIDATION_FAILED,
                file.getOriginalFilename(),
                "File signature validation failed for type: " + normalizedContentType
            );
            throw new InvalidRequestException(ERROR_FILE_SIGNATURE_MISMATCH);
        }

        if ("image/svg+xml".equals(normalizedContentType) && !validateSvgSecurity(file)) {
            throw new InvalidRequestException(ERROR_SVG_MALICIOUS_CONTENT);
        }
    }

    private boolean isValidMimeType(String mimeType) {
        return mimeType != null && ALLOWED_IMAGE_MIME_TYPES.contains(mimeType);
    }

    private boolean isValidExtension(String extension) {
        return extension != null && ALLOWED_IMAGE_EXTENSIONS.contains(extension.toLowerCase());
    }

    private Path securePathResolve(String filename, String operation) {
        if (filename.contains("..")) {
            log.warn("Attempted to {} file with invalid path: {}", operation, filename);
            return null;
        }

        Path resolvedPath = rootLocation.resolve(filename).normalize();
        if (!resolvedPath.startsWith(this.rootLocation)) {
            log.warn("Attempted to {} file outside directory: {}", operation, filename);
            return null;
        }

        return resolvedPath;
    }
}
