package io.github.sagimenahem.synchboard.service.util;

import org.slf4j.Logger;

import static io.github.sagimenahem.synchboard.constants.LoggingConstants.SECURITY_PREFIX;

public final class LoggingHelper {

    private LoggingHelper() {
        // Utility class
    }

    public static void logSecurityInfo(Logger logger, String message, Object... args) {
        logger.info(SECURITY_PREFIX + " " + message, args);
    }

    public static void logSecurityWarn(Logger logger, String message, Object... args) {
        logger.warn(SECURITY_PREFIX + " " + message, args);
    }

    public static void logSecurityError(Logger logger, String message, Object... args) {
        logger.error(SECURITY_PREFIX + " " + message, args);
    }

    public static void logSecurityDebug(Logger logger, String message, Object... args) {
        logger.debug(SECURITY_PREFIX + " " + message, args);
    }
}