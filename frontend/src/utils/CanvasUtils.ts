import { CANVAS_CONFIG, TOOLS } from 'constants/BoardConstants';
import type { ActionPayload, CirclePayload, EnhancedActionPayload, LinePayload, Point, RectanglePayload } from 'types/BoardObjectTypes';

export const getMouseCoordinates = (
  event: MouseEvent, 
  canvas: HTMLCanvasElement,
): { x: number; y: number } | null => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

export const isShapeSizeValid = (width: number, height: number): boolean => {
  return width > CANVAS_CONFIG.MIN_SHAPE_SIZE_THRESHOLD || height > CANVAS_CONFIG.MIN_SHAPE_SIZE_THRESHOLD;
};

export const isRadiusValid = (radius: number): boolean => {
  return radius > CANVAS_CONFIG.MIN_SHAPE_SIZE_THRESHOLD;
};

export const drawLinePayload = (
  payload: LinePayload, 
  targetCtx: CanvasRenderingContext2D, 
  targetCanvas: HTMLCanvasElement,
): void => {
  const { points, color, lineWidth } = payload;
  if (points.length < 2) return;

  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = lineWidth;

  if (payload.tool === TOOLS.ERASER) {
    targetCtx.globalCompositeOperation = CANVAS_CONFIG.COMPOSITE_OPERATIONS.ERASE;
  }

  targetCtx.beginPath();
  targetCtx.moveTo(points[0].x * targetCanvas.width, points[0].y * targetCanvas.height);

  for (let i = 1; i < points.length; i++) {
    targetCtx.lineTo(points[i].x * targetCanvas.width, points[i].y * targetCanvas.height);
  }

  targetCtx.stroke();
};

export const drawRectanglePayload = (
  payload: RectanglePayload, 
  targetCtx: CanvasRenderingContext2D, 
  targetCanvas: HTMLCanvasElement,
): void => {
  const { x, y, width, height, color, strokeWidth } = payload;

  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = strokeWidth;
  targetCtx.strokeRect(
    x * targetCanvas.width,
    y * targetCanvas.height,
    width * targetCanvas.width,
    height * targetCanvas.height,
  );
};

export const drawCirclePayload = (
  payload: CirclePayload, 
  targetCtx: CanvasRenderingContext2D, 
  targetCanvas: HTMLCanvasElement,
): void => {
  const { x, y, radius, color, strokeWidth } = payload;

  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = strokeWidth;
  targetCtx.beginPath();
  targetCtx.arc(x * targetCanvas.width, y * targetCanvas.height, radius * targetCanvas.width, 0, 2 * Math.PI);
  targetCtx.stroke();
};

export const setupCanvasContext = (canvas: HTMLCanvasElement | null): CanvasRenderingContext2D | null => {
  if (!canvas) return null;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (ctx) {
    ctx.lineCap = CANVAS_CONFIG.LINE_STYLE;
    ctx.lineJoin = CANVAS_CONFIG.LINE_STYLE;
  }

  return ctx;
};

const getTransactionOpacity = (payload: EnhancedActionPayload): number => {
  if (!payload.transactionId) return 1.0;
    
  switch (payload.transactionStatus) {
    case 'pending' as const:
      return 0.7;
    case 'failed':
      return 0.5;
    case 'confirmed':
    default:
      return 1.0;
  }
};

export const replayDrawAction = (
  payload: ActionPayload, 
  targetCtx: CanvasRenderingContext2D, 
  targetCanvas: HTMLCanvasElement,
): void => {
  const enhancedPayload = payload as EnhancedActionPayload;
  const opacity = getTransactionOpacity(enhancedPayload);
    
  const originalGlobalAlpha = targetCtx.globalAlpha;
  targetCtx.globalAlpha = opacity;
  targetCtx.globalCompositeOperation = CANVAS_CONFIG.COMPOSITE_OPERATIONS.DRAW;

  if (payload.tool === TOOLS.BRUSH || payload.tool === TOOLS.ERASER) {
    drawLinePayload(payload as LinePayload, targetCtx, targetCanvas);
  } else if (payload.tool === TOOLS.RECTANGLE) {
    drawRectanglePayload(payload as RectanglePayload, targetCtx, targetCanvas);
  } else if (payload.tool === TOOLS.CIRCLE) {
    drawCirclePayload(payload as CirclePayload, targetCtx, targetCanvas);
  }

  targetCtx.globalAlpha = originalGlobalAlpha;
  targetCtx.globalCompositeOperation = CANVAS_CONFIG.COMPOSITE_OPERATIONS.DRAW;
};

/**
 * Optimizes point arrays for drawing tools by reducing redundant points
 * while preserving visual quality and drawing accuracy.
 * 
 * This function is designed to work universally with all drawing tools
 * that use point arrays (brush, eraser, and future tools like pen, highlighter, etc.)
 * 
 * @param points Array of normalized points (0.0-1.0 coordinates)
 * @param enabled Whether optimization is enabled (default: from config)
 * @returns Optimized point array with reduced redundancy
 * 
 * Features:
 * - Always preserves start and end points for drawing accuracy
 * - Only applies to strokes above minimum threshold (avoids over-optimizing short strokes)
 * - Configurable decimation factor for different optimization levels
 * - Safe fallback when optimization is disabled
 * - Future-proof design for additional drawing tools
 */
export const optimizeDrawingPoints = (
  points: Point[],
  enabled: boolean = CANVAS_CONFIG.OPTIMIZATION.ENABLED,
): Point[] => {
  const { MIN_POINTS_THRESHOLD, DECIMATION_FACTOR, PRESERVE_ENDPOINTS } = CANVAS_CONFIG.OPTIMIZATION;
  
  // Skip optimization if disabled or stroke is too short
  if (!enabled || points.length < MIN_POINTS_THRESHOLD) {
    return points;
  }
  
  // For very short strokes, no optimization needed
  if (points.length <= 3) {
    return points;
  }
  
  // Apply simple decimation: keep every nth point
  const optimizedPoints = points.filter((_, index) => {
    // Always preserve start and end points if configured
    if (PRESERVE_ENDPOINTS && (index === 0 || index === points.length - 1)) {
      return true;
    }
    
    // Keep every nth point based on decimation factor
    return index % DECIMATION_FACTOR === 0;
  });
  
  // Ensure we always have at least start and end points
  if (optimizedPoints.length < 2 && points.length >= 2) {
    return [points[0], points[points.length - 1]];
  }
  
  return optimizedPoints;
};