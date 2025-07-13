// File: frontend/src/constants/board.constants.ts

/**
 * Available drawing tools.
 */
export const TOOLS = {
    BRUSH: 'brush',
    ERASER: 'eraser',
    RECTANGLE: 'rectangle',
    CIRCLE: 'circle',
} as const;

/**
 * An array of all tool names, useful for iterating in UI components.
 */
export const TOOL_LIST = Object.values(TOOLS);

/**
 * Default values for drawing tools.
 */
export const DEFAULT_DRAWING_CONFIG = {
    STROKE_COLOR: '#FFFFFF',
    STROKE_WIDTH: 3,
};

/**
 * Configuration for the stroke width selector.
 */
export const STROKE_WIDTH_RANGE = {
    MIN: 1,
    MAX: 50,
};

/**
 * Canvas specific settings.
 */
export const CANVAS_CONFIG = {
    LINE_STYLE: 'round',
    CURSOR: 'crosshair',
    BACKGROUND_COLOR: '#222',
    PREVIEW_ERASER_COLOR: '#222', // Color of the preview stroke for the eraser
    COMPOSITE_OPERATIONS: {
        DRAW: 'source-over',
        ERASE: 'destination-out',
    },
} as const;