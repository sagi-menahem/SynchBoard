package io.github.sagimenahem.synchboard.constants;

import java.util.Arrays;
import java.util.List;

public final class FileConstants {

        private FileConstants() {}

        public static final String IMAGES_BASE_PATH = "/images/";
        public static final String IMAGES_PATH_PATTERN = "/images/**";

        public static final String DEFAULT_SENDER_EMAIL = "unknown";

        public static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024;
        public static final int MAX_FILE_SIZE_MB = 5;

        public static final int HTTP_CONNECTION_TIMEOUT_MS = 5000;
        public static final int HTTP_READ_TIMEOUT_MS = 10000;

        public static final List<String> ALLOWED_IMAGE_MIME_TYPES = Arrays.asList("image/jpeg",
                        "image/png", "image/gif", "image/webp", "image/svg+xml");

        public static final List<String> ALLOWED_IMAGE_EXTENSIONS =
                        Arrays.asList(".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg");

        public static final List<String> SVG_DANGEROUS_PATTERNS = Arrays.asList("<script",
                        "javascript:", "onclick", "onload", "onerror", "onmouseover", "onmouseout",
                        "onmousemove", "onmouseenter", "onmouseleave", "onfocus", "onblur",
                        "oninput", "onchange", "onsubmit", "<iframe", "<embed", "<object",
                        "<foreignobject", "<applet", "data:text/html", "data:text/javascript",
                        "vbscript:", "livescript:", "mocha:", "eval(", "expression(", "import(",
                        "document.cookie", "document.write", "window.location", ".innerHTML",
                        ".outerHTML");

        public static final String ERROR_EMPTY_FILE = "Cannot upload empty file";
        public static final String ERROR_NO_FILENAME = "File must have a name";
        public static final String ERROR_INVALID_PATH = "Filename contains invalid path sequence";
        public static final String ERROR_FILE_TOO_LARGE =
                        "File size exceeds maximum allowed size of %d MB";
        public static final String ERROR_MIME_TYPE_NOT_ALLOWED =
                        "File type not allowed. Allowed types: %s";
        public static final String ERROR_EXTENSION_NOT_ALLOWED =
                        "File extension not allowed. Allowed extensions: %s";
        public static final String ERROR_FILE_SIGNATURE_MISMATCH =
                        "File content does not match its declared type. Possible security threat detected.";
        public static final String ERROR_SVG_MALICIOUS_CONTENT =
                        "SVG file contains potentially malicious content";
        public static final String ERROR_STORAGE_OUTSIDE_DIRECTORY =
                        "Cannot store file outside of upload directory";
        public static final String ERROR_FILE_STORAGE_FAILED = "Failed to store file";
}
