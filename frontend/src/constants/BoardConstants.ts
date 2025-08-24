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

export interface PointOptimizationConfig {
  readonly ENABLED: boolean;
  readonly MIN_POINTS_THRESHOLD: number;
  readonly DECIMATION_FACTOR: number;
  readonly PRESERVE_ENDPOINTS: boolean;
}

export const CANVAS_CONFIG = {
  LINE_STYLE: 'round',
  CURSOR: 'crosshair',
  DEFAULT_BACKGROUND_COLOR: '#222',
  DEFAULT_WIDTH: 1200,
  DEFAULT_HEIGHT: 800,
  MIN_WIDTH: 400,
  MAX_WIDTH: 4000,
  MIN_HEIGHT: 300,
  MAX_HEIGHT: 4000,
  PREVIEW_ERASER_COLOR: '#222',
  MIN_SHAPE_SIZE_THRESHOLD: 0.001,
  COMPOSITE_OPERATIONS: {
    DRAW: 'source-over',
    ERASE: 'destination-out',
  },
  OPTIMIZATION: {
    ENABLED: true,
    MIN_POINTS_THRESHOLD: 15,
    DECIMATION_FACTOR: 2,
    PRESERVE_ENDPOINTS: true,
  } satisfies PointOptimizationConfig,
  SIZE_PRESETS: {
    MEDIUM_LANDSCAPE: { width: 1920, height: 1080, label: 'Medium (1920×1080)', orientation: 'landscape' },
    LARGE_LANDSCAPE: { width: 2560, height: 1440, label: 'Large (2560×1440)', orientation: 'landscape' },
    EXTRA_LARGE_LANDSCAPE: { width: 3840, height: 2160, label: 'Extra Large (3840×2160)', orientation: 'landscape' },
    MEDIUM_PORTRAIT: { width: 1080, height: 1920, label: 'Medium (1080×1920)', orientation: 'portrait' },
    LARGE_PORTRAIT: { width: 1440, height: 2560, label: 'Large (1440×2560)', orientation: 'portrait' },
    EXTRA_LARGE_PORTRAIT: { width: 2160, height: 3840, label: 'Extra Large (2160×3840)', orientation: 'portrait' },
  },
} as const;

export const DEFAULT_CANVAS_PREFERENCES = {
  SPLIT_RATIO: 70,
} as const;
