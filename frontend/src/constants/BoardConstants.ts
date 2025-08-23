export const TOOLS = {
  BRUSH: 'brush',
  ERASER: 'eraser',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
} as const;

export const TOOL_LIST = Object.values(TOOLS);

export const DEFAULT_DRAWING_CONFIG = {
  STROKE_COLOR: '#FFFFFF',
  STROKE_WIDTH: 3,
  TOOLBAR_INITIAL_Y_POSITION: 30,
};

export const STROKE_WIDTH_RANGE = {
  MIN: 1,
  MAX: 50,
};

/**
 * Configuration interface for point optimization settings
 */
export interface PointOptimizationConfig {
  /** Whether point optimization is globally enabled */
  readonly ENABLED: boolean;
  /** Minimum number of points required before optimization is applied */
  readonly MIN_POINTS_THRESHOLD: number;
  /** Decimation factor - keep every nth point (2 = every 2nd point) */
  readonly DECIMATION_FACTOR: number;
  /** Whether to always preserve start and end points for drawing accuracy */
  readonly PRESERVE_ENDPOINTS: boolean;
}

/**
 * Canvas rendering and interaction configuration
 */
export const CANVAS_CONFIG = {
  LINE_STYLE: 'round',
  CURSOR: 'crosshair',
  BACKGROUND_COLOR: '#222',
  PREVIEW_ERASER_COLOR: '#222',
  MIN_SHAPE_SIZE_THRESHOLD: 0.001,
  COMPOSITE_OPERATIONS: {
    DRAW: 'source-over',
    ERASE: 'destination-out',
  },
  // Point optimization configuration
  OPTIMIZATION: {
    ENABLED: true,
    MIN_POINTS_THRESHOLD: 15, // Only optimize strokes with 15+ points
    DECIMATION_FACTOR: 2, // Keep every 2nd point for long strokes
    PRESERVE_ENDPOINTS: true, // Always keep first and last points
  } satisfies PointOptimizationConfig,
} as const;
