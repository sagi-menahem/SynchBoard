import { CANVAS_CONFIG, TOOLS } from 'constants/BoardConstants';
import type { ActionPayload, CirclePayload, EnhancedActionPayload, LinePayload, RectanglePayload } from 'types/BoardObjectTypes';

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

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.lineCap = CANVAS_CONFIG.LINE_STYLE;
    ctx.lineJoin = CANVAS_CONFIG.LINE_STYLE;
  }

  return ctx;
};

/**
 * Get the appropriate opacity based on transaction status
 */
const getTransactionOpacity = (payload: EnhancedActionPayload): number => {
  if (!payload.transactionId) return 1.0; // Server-originated object, fully opaque
    
  switch (payload.transactionStatus) {
    case 'pending' as const:
      return 0.7; // Semi-transparent for pending confirmation
    case 'failed':
      return 0.5; // More transparent for failed state
    case 'confirmed':
    default:
      return 1.0; // Fully opaque for confirmed or unknown states
  }
};

export const replayDrawAction = (
  payload: ActionPayload, 
  targetCtx: CanvasRenderingContext2D, 
  targetCanvas: HTMLCanvasElement,
): void => {
  const enhancedPayload = payload as EnhancedActionPayload;
  const opacity = getTransactionOpacity(enhancedPayload);
    
  // Save current context state
  const originalGlobalAlpha = targetCtx.globalAlpha;
    
  // Apply transaction-based opacity
  targetCtx.globalAlpha = opacity;
  targetCtx.globalCompositeOperation = CANVAS_CONFIG.COMPOSITE_OPERATIONS.DRAW;

  if (payload.tool === TOOLS.BRUSH || payload.tool === TOOLS.ERASER) {
    drawLinePayload(payload as LinePayload, targetCtx, targetCanvas);
  } else if (payload.tool === TOOLS.RECTANGLE) {
    drawRectanglePayload(payload as RectanglePayload, targetCtx, targetCanvas);
  } else if (payload.tool === TOOLS.CIRCLE) {
    drawCirclePayload(payload as CirclePayload, targetCtx, targetCanvas);
  }

  // Restore original context state
  targetCtx.globalAlpha = originalGlobalAlpha;
  targetCtx.globalCompositeOperation = CANVAS_CONFIG.COMPOSITE_OPERATIONS.DRAW;
};