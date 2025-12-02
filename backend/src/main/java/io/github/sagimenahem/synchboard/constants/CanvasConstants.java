package io.github.sagimenahem.synchboard.constants;

/**
 * Canvas configuration constants defining default values, limits, and settings for the
 * collaborative whiteboard canvas. These constants control the visual appearance, dimensions, and
 * behavior of the drawing surface across the application. Used by canvas initialization,
 * validation, and user preference systems.
 *
 * @author Sagi Menahem
 */
public final class CanvasConstants {

    // Canvas Default Visual Settings

    /**
     * Default background color for new canvases. Uses a dark theme color to provide contrast for
     * drawing elements.
     */
    public static final String DEFAULT_BACKGROUND_COLOR = "#222";

    /**
     * Default stroke color for drawing tools. White color provides good visibility against the dark
     * background.
     */
    public static final String DEFAULT_STROKE_COLOR = "#FFFFFF";

    /**
     * Default stroke width for drawing operations in pixels. Provides a balanced line thickness for
     * most drawing scenarios.
     */
    public static final double DEFAULT_STROKE_WIDTH = 2.0;

    // Canvas Default Dimensions

    /**
     * Default canvas width in pixels for newly created boards. Optimized for standard desktop
     * viewing while allowing room for tools and chat.
     */
    public static final int DEFAULT_CANVAS_WIDTH = 1200;

    /**
     * Default canvas height in pixels for newly created boards. Provides adequate vertical space
     * for drawing while fitting common screen sizes.
     */
    public static final int DEFAULT_CANVAS_HEIGHT = 800;

    // Canvas Size Limits

    /**
     * Minimum allowed canvas width in pixels. Ensures the canvas remains usable on smaller screens
     * and devices.
     */
    public static final int MIN_CANVAS_WIDTH = 400;

    /**
     * Maximum allowed canvas width in pixels. Prevents excessive memory usage and maintains
     * reasonable performance.
     */
    public static final int MAX_CANVAS_WIDTH = 4000;

    /**
     * Minimum allowed canvas height in pixels. Ensures adequate vertical space for meaningful
     * drawing operations.
     */
    public static final int MIN_CANVAS_HEIGHT = 300;

    /**
     * Maximum allowed canvas height in pixels. Balances large canvas support with system
     * performance requirements.
     */
    public static final int MAX_CANVAS_HEIGHT = 3000;

    // Application Default Settings

    /**
     * Default language code for user interface localization. English is used as the primary
     * language with i18n support for others.
     */
    public static final String DEFAULT_LANGUAGE = "en";

    /**
     * Default UI theme identifier. Light theme is used by default with dark theme available as an
     * option.
     */
    public static final String DEFAULT_THEME = "light";

    /**
     * Default split ratio between canvas and chat areas as a percentage. 70% allocated to canvas
     * provides optimal balance between drawing space and communication.
     */
    public static final double DEFAULT_CANVAS_CHAT_SPLIT_RATIO = 70.0;

    private CanvasConstants() {
        throw new UnsupportedOperationException("Utility class");
    }
}
