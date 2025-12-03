import { CANVAS_CONFIG, TOOLS } from 'features/board/constants/BoardConstants';
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
} from 'features/board/types/BoardObjectTypes';

/**
 * Converts browser pointer coordinates to canvas-relative pixel coordinates.
 * This function accounts for the canvas element's position and size within the viewport
 * to provide accurate coordinate mapping for drawing operations. Supports mouse, touch,
 * and stylus input through the Pointer Events API. Adjusts for zoom scale when canvas
 * is transformed via CSS.
 *
 * @param event - Pointer event containing browser-relative coordinates
 * @param canvas - Target canvas element for coordinate calculation
 * @param scale - Optional zoom scale factor (default 1.0 = no zoom)
 * @returns Canvas-relative coordinates or null if outside canvas bounds
 */
export const getPointerCoordinates = (
  event: PointerEvent,
  canvas: HTMLCanvasElement,
  scale = 1.0,
): { x: number; y: number } | null => {
  const rect = canvas.getBoundingClientRect();
  // Adjust coordinates for zoom scale - divide by scale to get actual canvas coordinates
  const x = (event.clientX - rect.left) / scale;
  const y = (event.clientY - rect.top) / scale;

  // Check if coordinates are within canvas bounds
  // This ensures drawing only happens when the pointer is actually over the canvas
  if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
    return null;
  }

  return { x, y };
};

/**
 * Validates whether a shape's dimensions meet the minimum size requirements.
 * This prevents creation of shapes that are too small to be useful or visible,
 * ensuring a better user experience in collaborative drawing.
 *
 * @param width - Normalized width of the shape (0-1)
 * @param height - Normalized height of the shape (0-1)
 * @returns True if the shape meets minimum size requirements
 */
export const isShapeSizeValid = (width: number, height: number): boolean => {
  return (
    width > CANVAS_CONFIG.MIN_SHAPE_SIZE_THRESHOLD ||
    height > CANVAS_CONFIG.MIN_SHAPE_SIZE_THRESHOLD
  );
};

/**
 * Validates whether a circular shape's radius meets minimum size requirements.
 * This ensures circles and other radial shapes are large enough to be meaningful
 * and visible in the collaborative drawing context.
 *
 * @param radius - Normalized radius value (0-1)
 * @returns True if the radius meets minimum size requirements
 */
export const isRadiusValid = (radius: number): boolean => {
  return radius > CANVAS_CONFIG.MIN_SHAPE_SIZE_THRESHOLD;
};

/**
 * Renders a line drawing (brush or eraser) on the target canvas.
 * This function handles both brush strokes and eraser operations by drawing
 * connected line segments through a series of points. For eraser tool,
 * it switches to destination-out composite operation to remove content.
 *
 * @param payload - Line drawing data including points, color, and tool type
 * @param targetCtx - Canvas rendering context to draw on
 * @param targetCanvas - Target canvas element for coordinate scaling
 */
export const drawLinePayload = (
  payload: LinePayload,
  targetCtx: CanvasRenderingContext2D,
  targetCanvas: HTMLCanvasElement,
): void => {
  const { points, color, lineWidth } = payload;
  if (points.length < 2) {
    // Need at least 2 points to draw a line segment
    return;
  }

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

/**
 * Renders a rectangular shape on the target canvas.
 * Supports both filled and outlined rectangles, handling coordinate
 * conversion from normalized values to canvas pixels. Used for both
 * rectangle and square drawing tools.
 *
 * @param payload - Rectangle drawing data including dimensions, colors, and stroke width
 * @param targetCtx - Canvas rendering context to draw on
 * @param targetCanvas - Target canvas element for coordinate scaling
 */
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

  if (fillColor && fillColor !== null) {
    targetCtx.fillStyle = fillColor;
    targetCtx.fillRect(rectX, rectY, rectWidth, rectHeight);
  }

  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = strokeWidth;
  targetCtx.strokeRect(rectX, rectY, rectWidth, rectHeight);
};

/**
 * Renders a circular shape on the target canvas.
 * Creates perfect circles with optional fill and stroke, converting normalized
 * coordinates and radius to canvas pixels. The radius is scaled relative to
 * canvas width for consistent proportions across different canvas sizes.
 *
 * @param payload - Circle drawing data including center point, radius, colors, and stroke width
 * @param targetCtx - Canvas rendering context to draw on
 * @param targetCanvas - Target canvas element for coordinate scaling
 */
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

  if (fillColor && fillColor !== null) {
    targetCtx.fillStyle = fillColor;
    targetCtx.fill();
  }

  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = strokeWidth;
  targetCtx.stroke();
};

/**
 * Renders a triangle shape on the canvas using three specific vertex coordinates.
 * Creates a triangle by connecting three points with normalized coordinates, supporting
 * both fill and stroke styling. Unlike regular polygons, this allows for arbitrary
 * triangle shapes defined by explicit vertex positions.
 *
 * @param payload - Triangle drawing data including three vertex coordinates, colors, and stroke width
 * @param targetCtx - Canvas 2D rendering context for drawing operations
 * @param targetCanvas - Canvas element for coordinate scaling calculations
 */
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

  if (fillColor && fillColor !== null) {
    targetCtx.fillStyle = fillColor;
    targetCtx.fill();
  }

  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = strokeWidth;
  targetCtx.stroke();
};

/**
 * Renders a regular polygon (pentagon, hexagon, etc.) on the canvas using normalized coordinates.
 * Creates a polygon with the specified number of sides, centered at the given position.
 * All vertices are calculated mathematically to form a perfect regular polygon with
 * consistent angles and side lengths.
 *
 * @param payload - Polygon drawing data including center position, radius, side count, colors, and stroke width
 * @param targetCtx - Canvas 2D rendering context for drawing operations
 * @param targetCanvas - Canvas element for coordinate scaling calculations
 */
export const drawPolygonPayload = (
  payload: PolygonPayload,
  targetCtx: CanvasRenderingContext2D,
  targetCanvas: HTMLCanvasElement,
): void => {
  const { x, y, radius, sides, color, fillColor, strokeWidth } = payload;

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

  if (fillColor && fillColor !== null) {
    targetCtx.fillStyle = fillColor;
    targetCtx.fill();
  }

  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = strokeWidth;
  targetCtx.stroke();
};

/**
 * Renders text within a bounded text box on the canvas with automatic word wrapping.
 * Handles text overflow with ellipsis, maintains proper line spacing, and clips content
 * to fit within the specified bounding box. Uses normalized coordinates for consistent
 * rendering across different canvas sizes.
 *
 * @param payload - Text rendering data including position, dimensions, text content, font size, and color
 * @param targetCtx - Canvas 2D rendering context for text drawing operations
 * @param targetCanvas - Canvas element for coordinate scaling and text measurement
 */
export const drawTextPayload = (
  payload: TextBoxPayload,
  targetCtx: CanvasRenderingContext2D,
  targetCanvas: HTMLCanvasElement,
): void => {
  const { x, y, width, height, text, fontSize, color } = payload;

  const pixelX = x * targetCanvas.width;
  const pixelY = y * targetCanvas.height;
  const pixelWidth = width * targetCanvas.width;
  const pixelHeight = height * targetCanvas.height;

  targetCtx.fillStyle = color;
  targetCtx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;
  targetCtx.textBaseline = 'top';

  targetCtx.save();

  targetCtx.beginPath();
  targetCtx.rect(pixelX, pixelY, pixelWidth, pixelHeight);
  targetCtx.clip();

  const lineHeight = fontSize * 1.2; // 1.2x multiplier provides readable spacing calculation between text lines

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

  let currentY = pixelY;
  for (const line of lines) {
    if (currentY + lineHeight > pixelY + pixelHeight) {
      const overflowText = '...';
      const overflowY = pixelY + pixelHeight - fontSize;

      targetCtx.clearRect(pixelX, overflowY - 2, pixelWidth, fontSize + 4); // 2px padding provides visual separation purpose above/below text

      targetCtx.fillText(overflowText, pixelX, overflowY);
      break;
    }

    targetCtx.fillText(line, pixelX, currentY);
    currentY += lineHeight;
  }

  targetCtx.restore();
};

/**
 * Renders a five-pointed star shape on the canvas using normalized coordinates.
 * Creates a star with alternating outer and inner radii to form the classic star pattern.
 * The inner radius is automatically calculated as 40% of the outer radius for proper proportions.
 *
 * @param payload - Star drawing data including center position, radius, colors, and stroke width
 * @param targetCtx - Canvas 2D rendering context for drawing operations
 * @param targetCanvas - Canvas element for coordinate scaling calculations
 */
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
  const innerRadius = outerRadius * 0.4; // 40% inner radius creates classic star proportions
  const points = 5; // Five-pointed star is the standard star shape

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

  if (fillColor && fillColor !== null) {
    targetCtx.fillStyle = fillColor;
    targetCtx.fill();
  }

  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = strokeWidth;
  targetCtx.stroke();
};

/**
 * Renders a straight line between two points on the canvas using normalized coordinates.
 * Supports optional dash patterns for dotted or dashed line styles. Properly manages
 * line dash state to prevent affecting subsequent drawing operations.
 *
 * @param payload - Line drawing data including start/end points, color, stroke width, and optional dash pattern
 * @param targetCtx - Canvas 2D rendering context for drawing operations
 * @param targetCanvas - Canvas element for coordinate scaling calculations
 */
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
    targetCtx.setLineDash([]);
  }
};

/**
 * Renders an arrow from one point to another with a proportional arrowhead.
 * Calculates the arrow angle and dimensions based on line length and stroke width,
 * creating a visually balanced arrow with a filled triangular arrowhead.
 * The arrowhead size adapts to the line thickness for consistent appearance.
 *
 * @param payload - Arrow drawing data including start/end points, color, and stroke width
 * @param targetCtx - Canvas 2D rendering context for drawing operations
 * @param targetCanvas - Canvas element for coordinate scaling calculations
 */
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

  // Calculate arrow direction and length from line endpoints
  const angle = Math.atan2(endY - startY, endX - startX);
  const lineLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

  // Scale arrowhead proportionally to stroke width with min/max bounds for visual balance
  const arrowLength = Math.max(strokeWidth * 3, Math.min(strokeWidth * 6, lineLength * 0.15));
  // Width is 60% of length for proper arrowhead proportions
  const arrowWidth = arrowLength * 0.6;
  // Calculate half-angle of arrowhead triangle using inverse tangent
  const arrowAngle = Math.atan(arrowWidth / arrowLength);

  // Adjust line endpoint to prevent overlap with arrowhead (30% overlap for visual continuity)
  const lineEndX = endX - arrowLength * 0.3 * Math.cos(angle);
  const lineEndY = endY - arrowLength * 0.3 * Math.sin(angle);

  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = strokeWidth;
  targetCtx.fillStyle = color;
  targetCtx.lineCap = 'round';
  targetCtx.lineJoin = 'round';

  targetCtx.beginPath();
  targetCtx.moveTo(startX, startY);
  targetCtx.lineTo(lineEndX, lineEndY);
  targetCtx.stroke();

  const arrowPoint1X = endX - arrowLength * Math.cos(angle - arrowAngle);
  const arrowPoint1Y = endY - arrowLength * Math.sin(angle - arrowAngle);
  const arrowPoint2X = endX - arrowLength * Math.cos(angle + arrowAngle);
  const arrowPoint2Y = endY - arrowLength * Math.sin(angle + arrowAngle);

  targetCtx.beginPath();
  targetCtx.moveTo(endX, endY);
  targetCtx.lineTo(arrowPoint1X, arrowPoint1Y);
  targetCtx.lineTo(arrowPoint2X, arrowPoint2Y);
  targetCtx.closePath();
  targetCtx.fill();

  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = Math.max(1, strokeWidth * 0.5); // Arrowhead outline is 50% of main stroke width, minimum 1px
  targetCtx.stroke();
};

/**
 * Initializes and configures a canvas 2D rendering context with optimal settings.
 * Sets up default line styles and enables frequent reading optimization for better
 * performance in collaborative drawing scenarios where canvas data is frequently accessed.
 *
 * @param canvas - Canvas element to initialize, or null for safety
 * @returns Configured 2D rendering context or null if canvas is invalid
 */
export const setupCanvasContext = (
  canvas: HTMLCanvasElement | null,
): CanvasRenderingContext2D | null => {
  if (!canvas) {
    return null;
  }

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (ctx) {
    ctx.lineCap = CANVAS_CONFIG.LINE_STYLE;
    ctx.lineJoin = CANVAS_CONFIG.LINE_STYLE;
  }

  return ctx;
};

/**
 * Determines opacity level based on transaction status for visual feedback.
 * Returns reduced opacity for pending or failed transactions to indicate
 * the current state of optimistic updates in collaborative drawing.
 *
 * @param payload - Enhanced action payload containing transaction metadata
 * @returns Opacity value (0.5-1.0) based on transaction status
 */
const getTransactionOpacity = (payload: EnhancedActionPayload): number => {
  if (!payload.transactionId) {
    return 1.0;
  }

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

/**
 * Replays a drawing action on the canvas with appropriate opacity based on transaction status.
 * Routes the drawing operation to the correct rendering function based on tool type,
 * applying visual feedback for pending, failed, or confirmed actions through opacity changes.
 * Essential for collaborative drawing synchronization and action state visualization.
 *
 * @param payload - Drawing action data containing tool type and rendering parameters
 * @param targetCtx - Canvas 2D rendering context for drawing operations
 * @param targetCanvas - Canvas element for coordinate scaling calculations
 */
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
    drawLinePayload(payload, targetCtx, targetCanvas);
  } else if (payload.tool === TOOLS.SQUARE || payload.tool === TOOLS.RECTANGLE) {
    drawRectanglePayload(payload, targetCtx, targetCanvas);
  } else if (payload.tool === TOOLS.CIRCLE) {
    drawCirclePayload(payload, targetCtx, targetCanvas);
  } else if (payload.tool === TOOLS.TRIANGLE) {
    drawTrianglePayload(payload, targetCtx, targetCanvas);
  } else if (payload.tool === TOOLS.PENTAGON || payload.tool === TOOLS.HEXAGON) {
    drawPolygonPayload(payload, targetCtx, targetCanvas);
  } else if (payload.tool === TOOLS.STAR) {
    drawStarPayload(payload, targetCtx, targetCanvas);
  } else if (payload.tool === TOOLS.LINE || payload.tool === TOOLS.DOTTED_LINE) {
    drawStraightLinePayload(payload, targetCtx, targetCanvas);
  } else if (payload.tool === TOOLS.ARROW) {
    drawArrowPayload(payload, targetCtx, targetCanvas);
  } else if (payload.tool === TOOLS.TEXT) {
    drawTextPayload(payload, targetCtx, targetCanvas);
  }

  targetCtx.globalAlpha = originalGlobalAlpha;
  targetCtx.globalCompositeOperation = CANVAS_CONFIG.COMPOSITE_OPERATIONS.DRAW;
};

/**
 * Optimizes drawing point arrays by reducing density while preserving shape quality.
 * Uses decimation to reduce the number of points in brush strokes, improving performance
 * for long drawing paths. Always preserves start and end points to maintain stroke integrity.
 * Applies configurable thresholds to avoid over-optimization of short strokes.
 *
 * @param points - Array of drawing points to optimize
 * @param enabled - Whether optimization is enabled (defaults to configuration setting)
 * @returns Optimized point array with reduced density but preserved shape
 */
export const optimizeDrawingPoints = (
  points: Point[],
  enabled: boolean = CANVAS_CONFIG.OPTIMIZATION.ENABLED,
): Point[] => {
  const { MIN_POINTS_THRESHOLD, DECIMATION_FACTOR, PRESERVE_ENDPOINTS } =
    CANVAS_CONFIG.OPTIMIZATION;

  if (!enabled || points.length < MIN_POINTS_THRESHOLD) {
    return points;
  }

  if (points.length <= 3) {
    // Short strokes don't benefit from optimization
    return points;
  }

  // Apply decimation while preserving critical points
  const optimizedPoints = points.filter((_, index) => {
    if (PRESERVE_ENDPOINTS && (index === 0 || index === points.length - 1)) {
      return true; // Always keep start and end points for stroke integrity
    }

    return index % DECIMATION_FACTOR === 0; // Keep every Nth point for density reduction
  });

  // Fallback for over-aggressive optimization
  if (optimizedPoints.length < 2 && points.length >= 2) {
    return [points[0], points[points.length - 1]]; // Minimum viable stroke with start and end points only
  }

  return optimizedPoints;
};

export interface CanvasPresetInfo {
  name: string;
  ratio: string | null;
  isCustom: boolean;
}

/**
 * Identifies canvas size preset information based on dimensions.
 * Matches provided width and height against known canvas size presets to determine
 * if the canvas uses a standard size (A4, Letter, etc.) or custom dimensions.
 * Returns preset name, aspect ratio, and custom status for UI display purposes.
 *
 * @param width - Canvas width in pixels
 * @param height - Canvas height in pixels
 * @returns Preset information including name, ratio, and custom status
 */
export const getCanvasPresetInfo = (width: number, height: number): CanvasPresetInfo => {
  for (const [key, preset] of Object.entries(CANVAS_CONFIG.CANVAS_SIZE_PRESETS)) {
    if (preset.width === width && preset.height === height) {
      return {
        name: key.toLowerCase(),
        ratio: preset.ratio,
        isCustom: false,
      };
    }
  }

  return {
    name: 'custom',
    ratio: null,
    isCustom: true,
  };
};

/**
 * Formats canvas resolution for display in user interface with localized preset names.
 * Combines preset information with actual dimensions to create user-friendly display strings.
 * Handles both standard presets (with aspect ratios) and custom sizes, using the provided
 * translation function to localize preset names for international users.
 *
 * @param width - Canvas width in pixels
 * @param height - Canvas height in pixels
 * @param t - Translation function for localizing preset names
 * @returns Formatted resolution string for UI display
 */
export const formatCanvasResolution = (
  width: number,
  height: number,
  t: (key: string) => string,
): string => {
  const presetInfo = getCanvasPresetInfo(width, height);

  if (presetInfo.isCustom) {
    return `${t('canvasSize.custom.label')} - ${width}×${height}`;
  }

  const presetName = t(`canvasSize.presets.${presetInfo.name}.label`);
  return `${presetName} (${presetInfo.ratio}) - ${width}×${height}`;
};
