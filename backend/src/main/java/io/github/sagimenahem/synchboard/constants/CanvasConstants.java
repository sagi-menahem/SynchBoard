package io.github.sagimenahem.synchboard.constants;

public final class CanvasConstants {

    public static final String DEFAULT_BACKGROUND_COLOR = "#222";
    public static final String DEFAULT_STROKE_COLOR = "#FFFFFF";
    public static final int DEFAULT_CANVAS_WIDTH = 1200;
    public static final int DEFAULT_CANVAS_HEIGHT = 800;
    public static final double DEFAULT_STROKE_WIDTH = 2.0;

    public static final int MIN_CANVAS_WIDTH = 400;
    public static final int MAX_CANVAS_WIDTH = 4000;
    public static final int MIN_CANVAS_HEIGHT = 300;
    public static final int MAX_CANVAS_HEIGHT = 3000;

    public static final String DEFAULT_LANGUAGE = "en";
    public static final String DEFAULT_THEME = "light";
    public static final double DEFAULT_CANVAS_CHAT_SPLIT_RATIO = 70.0;

    private CanvasConstants() {
        throw new UnsupportedOperationException("Utility class");
    }
}
