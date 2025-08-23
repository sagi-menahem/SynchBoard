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
  BACKGROUND_COLOR: '#222',
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
} as const;
