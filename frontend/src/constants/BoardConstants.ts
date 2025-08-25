export const TOOLS = {
  BRUSH: 'brush',
  ERASER: 'eraser',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  TRIANGLE: 'triangle',
  PENTAGON: 'pentagon',
  HEXAGON: 'hexagon',
  TEXT: 'text',
  COLOR_PICKER: 'colorPicker',
  FILL: 'fill',
  DOWNLOAD: 'download',
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
  CANVAS_SIZE_PRESETS: {
    WIDESCREEN: { 
      width: 1920, 
      height: 1080, 
      ratio: '16:9',
      key: 'widescreen',
    },
    SQUARE: { 
      width: 1200, 
      height: 1200, 
      ratio: '1:1',
      key: 'square',
    },
    PORTRAIT: { 
      width: 1080, 
      height: 1920, 
      ratio: '9:16',
      key: 'portrait',
    },
    DOCUMENT: { 
      width: 1240, 
      height: 1754, 
      ratio: 'A4',
      key: 'document',
    },
  },
  PRESET_ORDER: ['WIDESCREEN', 'SQUARE', 'PORTRAIT', 'DOCUMENT'] as const,
} as const;

export const DEFAULT_CANVAS_PREFERENCES = {
  SPLIT_RATIO: 70,
  DEFAULT_PRESET: 'WIDESCREEN',
  DEFAULT_WIDTH: CANVAS_CONFIG.CANVAS_SIZE_PRESETS.WIDESCREEN.width,
  DEFAULT_HEIGHT: CANVAS_CONFIG.CANVAS_SIZE_PRESETS.WIDESCREEN.height,
} as const;
