package io.github.sagimenahem.synchboard.constants;

import java.util.Arrays;
import java.util.List;

/**
 * File handling constants defining paths, validation rules, security constraints, and error
 * messages for file upload and management operations. These constants ensure secure file handling,
 * prevent malicious uploads, and maintain consistent file processing behavior across the SynchBoard
 * application.
 *
 * @author Sagi Menahem
 */
public final class FileConstants {

    private FileConstants() {}

    // File Path Configuration

    /**
     * Base path for serving image files. Used by the web server to map image URLs to file system
     * locations.
     */
    public static final String IMAGES_BASE_PATH = "/images/";

    /**
     * URL pattern for image file access. Used in Spring Security configuration to allow public
     * access to images.
     */
    public static final String IMAGES_PATH_PATTERN = "/images/**";

    // Default Values

    /**
     * Default sender email for system operations. Used when sender information is not available or
     * applicable.
     */
    public static final String DEFAULT_SENDER_EMAIL = "unknown";

    // File Size Limits

    /**
     * Maximum allowed file size in bytes (5 MB). Prevents large file uploads that could impact
     * server performance and storage.
     */
    public static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024;

    /**
     * Maximum allowed file size in megabytes. User-friendly representation of the file size limit
     * for UI display.
     */
    public static final int MAX_FILE_SIZE_MB = 5;

    // Network Timeout Configuration

    /**
     * HTTP connection timeout in milliseconds for file operations. Prevents hanging connections
     * during file transfers.
     */
    public static final int HTTP_CONNECTION_TIMEOUT_MS = 5000;

    /**
     * HTTP read timeout in milliseconds for file operations. Allows reasonable time for file data
     * transfer while preventing stalls.
     */
    public static final int HTTP_READ_TIMEOUT_MS = 10000;

    // Allowed File Types

    /**
     * List of permitted MIME types for image uploads. Restricts uploads to safe, commonly supported
     * image formats. Used for server-side validation of uploaded files.
     */
    public static final List<String> ALLOWED_IMAGE_MIME_TYPES = Arrays.asList(
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml"
    );

    /**
     * List of permitted file extensions for image uploads. Provides additional validation layer
     * based on file naming. Extensions are checked in lowercase for case-insensitive validation.
     */
    public static final List<String> ALLOWED_IMAGE_EXTENSIONS = Arrays.asList(
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".svg"
    );

    // Security Validation Patterns

    /**
     * List of potentially dangerous patterns in SVG files. Used to scan SVG content for malicious
     * code that could execute in browsers when the SVG is displayed. This prevents XSS attacks and
     * other security vulnerabilities through uploaded SVG files. Patterns are checked
     * case-insensitively during validation.
     */
    public static final List<String> SVG_DANGEROUS_PATTERNS = Arrays.asList(
        "<script",
        "javascript:",
        "onclick",
        "onload",
        "onerror",
        "onmouseover",
        "onmouseout",
        "onmousemove",
        "onmouseenter",
        "onmouseleave",
        "onfocus",
        "onblur",
        "oninput",
        "onchange",
        "onsubmit",
        "<iframe",
        "<embed",
        "<object",
        "<foreignobject",
        "<applet",
        "data:text/html",
        "data:text/javascript",
        "vbscript:",
        "livescript:",
        "mocha:",
        "eval(",
        "expression(",
        "import(",
        "document.cookie",
        "document.write",
        "window.location",
        ".innerHTML",
        ".outerHTML"
    );

    // Error Messages

    /**
     * Error message for empty file upload attempts. Used when users try to upload files with zero
     * bytes.
     */
    public static final String ERROR_EMPTY_FILE = "Cannot upload empty file";

    /**
     * Error message for files without names. Used when uploaded files lack proper filename
     * information.
     */
    public static final String ERROR_NO_FILENAME = "File must have a name";

    /**
     * Error message for invalid file paths. Used when filenames contain directory traversal
     * sequences or other path exploits.
     */
    public static final String ERROR_INVALID_PATH = "Filename contains invalid path sequence";

    /**
     * Error message template for files exceeding size limits. Uses String.format() with maximum
     * file size in MB as parameter.
     */
    public static final String ERROR_FILE_TOO_LARGE = "File size exceeds maximum allowed size of %d MB";

    /**
     * Error message template for disallowed MIME types. Uses String.format() with list of allowed
     * types as parameter.
     */
    public static final String ERROR_MIME_TYPE_NOT_ALLOWED = "File type not allowed. Allowed types: %s";

    /**
     * Error message template for disallowed file extensions. Uses String.format() with list of
     * allowed extensions as parameter.
     */
    public static final String ERROR_EXTENSION_NOT_ALLOWED = "File extension not allowed. Allowed extensions: %s";

    /**
     * Error message for file signature validation failures. Used when file content doesn't match
     * the declared MIME type, indicating potential security threats.
     */
    public static final String ERROR_FILE_SIGNATURE_MISMATCH =
        "File content does not match its declared type. Possible security threat detected.";

    /**
     * Error message for malicious SVG content detection. Used when SVG files contain potentially
     * dangerous scripts or elements.
     */
    public static final String ERROR_SVG_MALICIOUS_CONTENT = "SVG file contains potentially malicious content";

    /**
     * Error message for directory traversal prevention. Used when file storage attempts would place
     * files outside the designated upload directory.
     */
    public static final String ERROR_STORAGE_OUTSIDE_DIRECTORY = "Cannot store file outside of upload directory";

    /**
     * Error message for general file storage failures. Used when file system operations fail during
     * the storage process.
     */
    public static final String ERROR_FILE_STORAGE_FAILED = "Failed to store file";
}
