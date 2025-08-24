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
  MAX_WIDTH: 3000,
  MIN_HEIGHT: 300,
  MAX_HEIGHT: 2000,
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
    SMALL: { width: 800, height: 600, label: 'Small (800x600)' },
    MEDIUM: { width: 1200, height: 800, label: 'Medium (1200x800)' },
    LARGE: { width: 1600, height: 1200, label: 'Large (1600x1200)' },
  },
} as const;

export const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200] as const;

export const DEFAULT_CANVAS_PREFERENCES = {
  ZOOM_LEVEL: 100,
  SPLIT_RATIO: 70,
} as const;
