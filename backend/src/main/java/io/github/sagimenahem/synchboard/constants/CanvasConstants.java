package io.github.sagimenahem.synchboard.constants;

/**
 * Constants related to canvas configuration and drawing functionality.
 * This class contains default values, constraints, and other canvas-related constants.
 */
public final class CanvasConstants {

    // Default canvas values
    public static final String DEFAULT_BACKGROUND_COLOR = "#222";
    public static final String DEFAULT_STROKE_COLOR = "#FFFFFF";
    public static final int DEFAULT_CANVAS_WIDTH = 1200;
    public static final int DEFAULT_CANVAS_HEIGHT = 800;
    public static final double DEFAULT_STROKE_WIDTH = 2.0;

    // Canvas constraints
    public static final int MIN_CANVAS_WIDTH = 400;
    public static final int MAX_CANVAS_WIDTH = 4000;
    public static final int MIN_CANVAS_HEIGHT = 300;
    public static final int MAX_CANVAS_HEIGHT = 3000;

    // Default user preferences
    public static final String DEFAULT_LANGUAGE = "en";
    public static final String DEFAULT_THEME = "light";
    public static final double DEFAULT_CANVAS_CHAT_SPLIT_RATIO = 70.0;

    private CanvasConstants() {
        throw new UnsupportedOperationException("Utility class");
    }
}