import { CANVAS_CONFIG, TOOLS } from 'constants/BoardConstants';
import type {
  ActionPayload,
  ArrowPayload,
  CirclePayload,
  EnhancedActionPayload,
  LinePayload,
  Point,
  PolygonPayload,
  RectanglePayload,
  StraightLinePayload,
  TextBoxPayload,
  TrianglePayload,
} from 'types/BoardObjectTypes';

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
  const { x, y, width, height, color, fillColor, strokeWidth } = payload;

  const rectX = x * targetCanvas.width;
  const rectY = y * targetCanvas.height;
  const rectWidth = width * targetCanvas.width;
  const rectHeight = height * targetCanvas.height;

  // Draw fill if fillColor is provided and not null
  if (fillColor && fillColor !== null) {
    targetCtx.fillStyle = fillColor;
    targetCtx.fillRect(rectX, rectY, rectWidth, rectHeight);
  }

  // Draw stroke
  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = strokeWidth;
  targetCtx.strokeRect(rectX, rectY, rectWidth, rectHeight);
};

export const drawCirclePayload = (
  payload: CirclePayload, 
  targetCtx: CanvasRenderingContext2D, 
  targetCanvas: HTMLCanvasElement,
): void => {
  const { x, y, radius, color, fillColor, strokeWidth } = payload;

  const centerX = x * targetCanvas.width;
  const centerY = y * targetCanvas.height;
  const actualRadius = radius * targetCanvas.width;

  targetCtx.beginPath();
  targetCtx.arc(centerX, centerY, actualRadius, 0, 2 * Math.PI);

  // Draw fill if fillColor is provided and not null
  if (fillColor && fillColor !== null) {
    targetCtx.fillStyle = fillColor;
    targetCtx.fill();
  }

  // Draw stroke
  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = strokeWidth;
  targetCtx.stroke();
};

export const drawTrianglePayload = (
  payload: TrianglePayload,
  targetCtx: CanvasRenderingContext2D,
  targetCanvas: HTMLCanvasElement,
): void => {
  const { x1, y1, x2, y2, x3, y3, color, fillColor, strokeWidth } = payload;

  targetCtx.beginPath();
  targetCtx.moveTo(x1 * targetCanvas.width, y1 * targetCanvas.height);
  targetCtx.lineTo(x2 * targetCanvas.width, y2 * targetCanvas.height);
  targetCtx.lineTo(x3 * targetCanvas.width, y3 * targetCanvas.height);
  targetCtx.closePath();

  // Draw fill if fillColor is provided and not null
  if (fillColor && fillColor !== null) {
    targetCtx.fillStyle = fillColor;
    targetCtx.fill();
  }

  // Draw stroke
  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = strokeWidth;
  targetCtx.stroke();
};

export const drawPolygonPayload = (
  payload: PolygonPayload,
  targetCtx: CanvasRenderingContext2D,
  targetCanvas: HTMLCanvasElement,
): void => {
  const { x, y, radius, sides, color, fillColor, strokeWidth } = payload;

  // Use the smaller dimension for radius scaling to maintain aspect ratio
  const radiusScale = Math.min(targetCanvas.width, targetCanvas.height);
  const centerX = x * targetCanvas.width;
  const centerY = y * targetCanvas.height;
  const actualRadius = radius * radiusScale;

  targetCtx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    const pointX = centerX + actualRadius * Math.cos(angle);
    const pointY = centerY + actualRadius * Math.sin(angle);
    
    if (i === 0) {
      targetCtx.moveTo(pointX, pointY);
    } else {
      targetCtx.lineTo(pointX, pointY);
    }
  }
  targetCtx.closePath();

  // Draw fill if fillColor is provided and not null
  if (fillColor && fillColor !== null) {
    targetCtx.fillStyle = fillColor;
    targetCtx.fill();
  }

  // Draw stroke
  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = strokeWidth;
  targetCtx.stroke();
};

export const drawTextPayload = (
  payload: TextBoxPayload,
  targetCtx: CanvasRenderingContext2D,
  targetCanvas: HTMLCanvasElement,
): void => {
  const { x, y, width, height, text, fontSize, color } = payload;

  // Convert normalized coordinates to pixel coordinates
  const pixelX = x * targetCanvas.width;
  const pixelY = y * targetCanvas.height;
  const pixelWidth = width * targetCanvas.width;
  const pixelHeight = height * targetCanvas.height;

  // Set up text properties
  targetCtx.fillStyle = color;
  targetCtx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;
  targetCtx.textBaseline = 'top';

  // Save canvas state for clipping
  targetCtx.save();
  
  // Create clipping rectangle
  targetCtx.beginPath();
  targetCtx.rect(pixelX, pixelY, pixelWidth, pixelHeight);
  targetCtx.clip();

  // Calculate line height (font size + small spacing)
  const lineHeight = fontSize * 1.2;
  
  // Split text into words for word wrapping
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = targetCtx.measureText(testLine);
    
    if (metrics.width > pixelWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // Draw text lines
  let currentY = pixelY;
  for (const line of lines) {
    if (currentY + lineHeight > pixelY + pixelHeight) {
      // Text exceeds bounds - draw overflow indicator
      const overflowText = '...';
      const overflowY = pixelY + pixelHeight - fontSize;
      
      // Clear the last bit of space for the ellipsis
      targetCtx.clearRect(pixelX, overflowY - 2, pixelWidth, fontSize + 4);
      
      // Draw the ellipsis
      targetCtx.fillText(overflowText, pixelX, overflowY);
      break;
    }
    
    targetCtx.fillText(line, pixelX, currentY);
    currentY += lineHeight;
  }
  
  // Restore canvas state
  targetCtx.restore();
};


export const drawStarPayload = (
  payload: PolygonPayload,
  targetCtx: CanvasRenderingContext2D,
  targetCanvas: HTMLCanvasElement,
): void => {
  const { x, y, radius, color, fillColor, strokeWidth } = payload;
  
  const radiusScale = Math.min(targetCanvas.width, targetCanvas.height);
  const centerX = x * targetCanvas.width;
  const centerY = y * targetCanvas.height;
  const outerRadius = radius * radiusScale;
  const innerRadius = outerRadius * 0.4; // Inner radius is 40% of outer
  const points = 5; // 5-pointed star
  
  targetCtx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const pointX = centerX + r * Math.cos(angle);
    const pointY = centerY + r * Math.sin(angle);
    
    if (i === 0) {
      targetCtx.moveTo(pointX, pointY);
    } else {
      targetCtx.lineTo(pointX, pointY);
    }
  }
  targetCtx.closePath();

  // Draw fill if fillColor is provided and not null
  if (fillColor && fillColor !== null) {
    targetCtx.fillStyle = fillColor;
    targetCtx.fill();
  }

  // Draw stroke
  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = strokeWidth;
  targetCtx.stroke();
};

export const drawStraightLinePayload = (
  payload: StraightLinePayload,
  targetCtx: CanvasRenderingContext2D,
  targetCanvas: HTMLCanvasElement,
): void => {
  const { x1, y1, x2, y2, color, strokeWidth, dashPattern } = payload;
  
  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = strokeWidth;
  
  if (dashPattern) {
    targetCtx.setLineDash(dashPattern);
  }
  
  targetCtx.beginPath();
  targetCtx.moveTo(x1 * targetCanvas.width, y1 * targetCanvas.height);
  targetCtx.lineTo(x2 * targetCanvas.width, y2 * targetCanvas.height);
  targetCtx.stroke();
  
  if (dashPattern) {
    targetCtx.setLineDash([]); // Reset dash pattern
  }
};

export const drawArrowPayload = (
  payload: ArrowPayload,
  targetCtx: CanvasRenderingContext2D,
  targetCanvas: HTMLCanvasElement,
): void => {
  const { x1, y1, x2, y2, color, strokeWidth } = payload;
  
  const startX = x1 * targetCanvas.width;
  const startY = y1 * targetCanvas.height;
  const endX = x2 * targetCanvas.width;
  const endY = y2 * targetCanvas.height;
  
  // Calculate arrow properties
  const angle = Math.atan2(endY - startY, endX - startX);
  const lineLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  
  // Improved arrowhead dimensions - scale with stroke width and line length
  const arrowLength = Math.max(strokeWidth * 3, Math.min(strokeWidth * 6, lineLength * 0.15));
  const arrowWidth = arrowLength * 0.6; // Width of arrowhead base
  const arrowAngle = Math.atan(arrowWidth / arrowLength);
  
  // Calculate where the line should end (before the arrowhead)
  const lineEndX = endX - (arrowLength * 0.3) * Math.cos(angle);
  const lineEndY = endY - (arrowLength * 0.3) * Math.sin(angle);
  
  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = strokeWidth;
  targetCtx.fillStyle = color;
  targetCtx.lineCap = 'round';
  targetCtx.lineJoin = 'round';
  
  // Draw the line (slightly shorter to avoid overlap with arrowhead)
  targetCtx.beginPath();
  targetCtx.moveTo(startX, startY);
  targetCtx.lineTo(lineEndX, lineEndY);
  targetCtx.stroke();
  
  // Draw improved arrowhead - more proportional and elegant
  const arrowPoint1X = endX - arrowLength * Math.cos(angle - arrowAngle);
  const arrowPoint1Y = endY - arrowLength * Math.sin(angle - arrowAngle);
  const arrowPoint2X = endX - arrowLength * Math.cos(angle + arrowAngle);
  const arrowPoint2Y = endY - arrowLength * Math.sin(angle + arrowAngle);
  
  // Draw filled arrowhead
  targetCtx.beginPath();
  targetCtx.moveTo(endX, endY);
  targetCtx.lineTo(arrowPoint1X, arrowPoint1Y);
  targetCtx.lineTo(arrowPoint2X, arrowPoint2Y);
  targetCtx.closePath();
  targetCtx.fill();
  
  // Add a subtle stroke to the arrowhead for better definition
  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = Math.max(1, strokeWidth * 0.5);
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
  } else if (payload.tool === TOOLS.SQUARE || payload.tool === TOOLS.RECTANGLE) {
    drawRectanglePayload(payload as RectanglePayload, targetCtx, targetCanvas);
  } else if (payload.tool === TOOLS.CIRCLE) {
    drawCirclePayload(payload as CirclePayload, targetCtx, targetCanvas);
  } else if (payload.tool === TOOLS.TRIANGLE) {
    drawTrianglePayload(payload as TrianglePayload, targetCtx, targetCanvas);
  } else if (payload.tool === TOOLS.PENTAGON || payload.tool === TOOLS.HEXAGON) {
    drawPolygonPayload(payload as PolygonPayload, targetCtx, targetCanvas);
  } else if (payload.tool === TOOLS.STAR) {
    drawStarPayload(payload as PolygonPayload, targetCtx, targetCanvas);
  } else if (payload.tool === TOOLS.LINE || payload.tool === TOOLS.DOTTED_LINE) {
    drawStraightLinePayload(payload as StraightLinePayload, targetCtx, targetCanvas);
  } else if (payload.tool === TOOLS.ARROW) {
    drawArrowPayload(payload as ArrowPayload, targetCtx, targetCanvas);
  } else if (payload.tool === TOOLS.TEXT) {
    drawTextPayload(payload as TextBoxPayload, targetCtx, targetCanvas);
  }

  targetCtx.globalAlpha = originalGlobalAlpha;
  targetCtx.globalCompositeOperation = CANVAS_CONFIG.COMPOSITE_OPERATIONS.DRAW;
};

export const optimizeDrawingPoints = (
  points: Point[],
  enabled: boolean = CANVAS_CONFIG.OPTIMIZATION.ENABLED,
): Point[] => {
  const { MIN_POINTS_THRESHOLD, DECIMATION_FACTOR, PRESERVE_ENDPOINTS } = CANVAS_CONFIG.OPTIMIZATION;
  
  if (!enabled || points.length < MIN_POINTS_THRESHOLD) {
    return points;
  }
  
  if (points.length <= 3) {
    return points;
  }
  
  const optimizedPoints = points.filter((_, index) => {
    if (PRESERVE_ENDPOINTS && (index === 0 || index === points.length - 1)) {
      return true;
    }
    
    return index % DECIMATION_FACTOR === 0;
  });
  
  if (optimizedPoints.length < 2 && points.length >= 2) {
    return [points[0], points[points.length - 1]];
  }
  
  return optimizedPoints;
};

export interface CanvasPresetInfo {
  name: string;
  ratio: string | null;
  isCustom: boolean;
}

export const getCanvasPresetInfo = (width: number, height: number): CanvasPresetInfo => {
  // Check if dimensions match any preset
  for (const [key, preset] of Object.entries(CANVAS_CONFIG.CANVAS_SIZE_PRESETS)) {
    if (preset.width === width && preset.height === height) {
      return {
        name: key.toLowerCase(),
        ratio: preset.ratio,
        isCustom: false,
      };
    }
  }
  
  // Return custom if no preset match
  return {
    name: 'custom',
    ratio: null,
    isCustom: true,
  };
};

export const formatCanvasResolution = (width: number, height: number, t: (key: string) => string): string => {
  const presetInfo = getCanvasPresetInfo(width, height);
  
  if (presetInfo.isCustom) {
    return `${t('canvasSize.custom.label')} - ${width}×${height}`;
  }
  
  const presetName = t(`canvasSize.presets.${presetInfo.name}.label`);
  return `${presetName} (${presetInfo.ratio}) - ${width}×${height}`;
};