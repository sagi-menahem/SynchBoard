import { TOOLS } from 'features/board/constants/BoardConstants';
import {
  ActionType,
  type ArrowPayload,
  type CirclePayload,
  type LinePayload,
  type Point,
  type PolygonPayload,
  type RectanglePayload,
  type SendBoardActionRequest,
  type StraightLinePayload,
  type TrianglePayload,
} from 'features/board/types/BoardObjectTypes';
import { optimizeDrawingPoints } from 'features/board/utils/CanvasUtils';
import { useCallback, useMemo } from 'react';
import type { Tool } from 'shared/types/CommonTypes';

import type { CanvasEventData } from './useCanvasEvents';

// =============================================================================
// TYPES
// =============================================================================

export interface DrawingToolsState {
  currentPath: React.RefObject<Point[]>;
}

interface UseDrawingToolsProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  tool: Tool;
  strokeWidth: number;
  strokeColor: string;
  onDraw: (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => void;
  senderId: string;
  drawingState: DrawingToolsState;
  isShapeSizeValid: (width: number, height: number) => boolean;
  isRadiusValid: (radius: number) => boolean;
  onTextInputRequest?: (x: number, y: number, width: number, height: number) => void;
}

interface ToolHandlerContext {
  canvas: HTMLCanvasElement;
  startPoint: Point;
  currentPoint: Point;
  strokeColor: string;
  strokeWidth: number;
  senderId: string;
  onDraw: (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => void;
  isShapeSizeValid: (width: number, height: number) => boolean;
  isRadiusValid: (radius: number) => boolean;
  onTextInputRequest?: (x: number, y: number, width: number, height: number) => void;
  currentPath: React.RefObject<Point[]>;
}

type ToolPointerUpHandler = (ctx: ToolHandlerContext) => void;

// =============================================================================
// TOOL HANDLERS
// =============================================================================

/**
 * Handler for brush and eraser tools.
 * Optimizes drawing points and creates a line payload.
 */
const handleBrushOrEraser = (ctx: ToolHandlerContext, tool: 'brush' | 'eraser'): void => {
  const { strokeColor, strokeWidth, senderId, onDraw, currentPath } = ctx;

  if (currentPath.current.length <= 1) {
    return; // Need at least 2 points for a valid stroke
  }

  const optimizedPoints = optimizeDrawingPoints([...currentPath.current]);

  const payload: Omit<LinePayload, 'instanceId'> = {
    tool,
    points: optimizedPoints,
    color: strokeColor,
    lineWidth: strokeWidth,
  };
  onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
};

/**
 * Handler for square tool.
 * Creates a square with equal width and height.
 */
const handleSquare: ToolPointerUpHandler = (ctx) => {
  const { canvas, startPoint, currentPoint, strokeColor, strokeWidth, senderId, onDraw, isShapeSizeValid } = ctx;

  const width = currentPoint.x - startPoint.x;
  const height = currentPoint.y - startPoint.y;
  const size = Math.max(Math.abs(width), Math.abs(height));

  // Adjust positions when dragging in different directions
  const squareX = width < 0 ? startPoint.x - size : startPoint.x;
  const squareY = height < 0 ? startPoint.y - size : startPoint.y;

  const normalizedX = squareX / canvas.width;
  const normalizedY = squareY / canvas.height;
  const normalizedWidth = size / canvas.width;
  const normalizedHeight = size / canvas.height;

  if (!isShapeSizeValid(normalizedWidth, normalizedHeight)) {
    return;
  }

  const payload: Omit<RectanglePayload, 'instanceId'> = {
    tool: TOOLS.SQUARE,
    x: normalizedX,
    y: normalizedY,
    width: normalizedWidth,
    height: normalizedHeight,
    color: strokeColor,
    strokeWidth,
  };
  onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
};

/**
 * Handler for rectangle tool.
 * Creates a rectangle with independent width and height.
 */
const handleRectangle: ToolPointerUpHandler = (ctx) => {
  const { canvas, startPoint, currentPoint, strokeColor, strokeWidth, senderId, onDraw, isShapeSizeValid } = ctx;

  // Calculate top-left corner (handles drag in any direction)
  const rectX = Math.min(startPoint.x, currentPoint.x) / canvas.width;
  const rectY = Math.min(startPoint.y, currentPoint.y) / canvas.height;
  const rectWidth = Math.abs(currentPoint.x - startPoint.x) / canvas.width;
  const rectHeight = Math.abs(currentPoint.y - startPoint.y) / canvas.height;

  if (!isShapeSizeValid(rectWidth, rectHeight)) {
    return;
  }

  const payload: Omit<RectanglePayload, 'instanceId'> = {
    tool: TOOLS.RECTANGLE,
    x: rectX,
    y: rectY,
    width: rectWidth,
    height: rectHeight,
    color: strokeColor,
    strokeWidth,
  };
  onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
};

/**
 * Handler for circle tool.
 * Creates a circle with radius based on distance from start point.
 */
const handleCircle: ToolPointerUpHandler = (ctx) => {
  const { canvas, startPoint, currentPoint, strokeColor, strokeWidth, senderId, onDraw, isRadiusValid } = ctx;

  const radius =
    Math.sqrt(
      Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2),
    ) / canvas.width;

  if (!isRadiusValid(radius)) {
    return;
  }

  const payload: Omit<CirclePayload, 'instanceId'> = {
    tool: TOOLS.CIRCLE,
    x: startPoint.x / canvas.width,
    y: startPoint.y / canvas.height,
    radius,
    color: strokeColor,
    strokeWidth,
  };
  onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
};

/**
 * Handler for triangle tool.
 * Creates an isosceles triangle.
 */
const handleTriangle: ToolPointerUpHandler = (ctx) => {
  const { canvas, startPoint, currentPoint, strokeColor, strokeWidth, senderId, onDraw, isShapeSizeValid } = ctx;

  const width = Math.abs(currentPoint.x - startPoint.x) / canvas.width;
  const height = Math.abs(currentPoint.y - startPoint.y) / canvas.height;

  if (!isShapeSizeValid(width, height)) {
    return;
  }

  const payload: Omit<TrianglePayload, 'instanceId'> = {
    tool: TOOLS.TRIANGLE,
    // Top vertex: horizontal midpoint between start and current, at start Y level
    x1: (startPoint.x + (currentPoint.x - startPoint.x) / 2) / canvas.width,
    y1: startPoint.y / canvas.height,
    // Bottom-left vertex: at start X position and current Y level
    x2: startPoint.x / canvas.width,
    y2: currentPoint.y / canvas.height,
    // Bottom-right vertex: at current X and Y position
    x3: currentPoint.x / canvas.width,
    y3: currentPoint.y / canvas.height,
    color: strokeColor,
    strokeWidth,
  };
  onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
};

/**
 * Handler for polygon tools (pentagon, hexagon).
 * Creates a regular polygon with the specified number of sides.
 */
const handlePolygon = (ctx: ToolHandlerContext, tool: 'pentagon' | 'hexagon'): void => {
  const { canvas, startPoint, currentPoint, strokeColor, strokeWidth, senderId, onDraw, isRadiusValid } = ctx;

  const pixelRadius = Math.sqrt(
    Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2),
  );
  const normalizedRadius = pixelRadius / Math.min(canvas.width, canvas.height);

  if (!isRadiusValid(normalizedRadius)) {
    return;
  }

  const sides = tool === TOOLS.PENTAGON ? 5 : 6;
  const payload: Omit<PolygonPayload, 'instanceId'> = {
    tool,
    x: startPoint.x / canvas.width,
    y: startPoint.y / canvas.height,
    radius: normalizedRadius,
    sides,
    color: strokeColor,
    strokeWidth,
  };
  onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
};

/**
 * Handler for star tool.
 * Creates a 5-pointed star.
 */
const handleStar: ToolPointerUpHandler = (ctx) => {
  const { canvas, startPoint, currentPoint, strokeColor, strokeWidth, senderId, onDraw, isRadiusValid } = ctx;

  const pixelRadius = Math.sqrt(
    Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2),
  );
  const normalizedRadius = pixelRadius / Math.min(canvas.width, canvas.height);

  if (!isRadiusValid(normalizedRadius)) {
    return;
  }

  const payload: Omit<PolygonPayload, 'instanceId'> = {
    tool: TOOLS.STAR,
    x: startPoint.x / canvas.width,
    y: startPoint.y / canvas.height,
    radius: normalizedRadius,
    sides: 5,
    color: strokeColor,
    strokeWidth,
  };
  onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
};

/**
 * Handler for line tools (line, dotted line).
 * Creates a straight line between two points.
 */
const handleLine = (ctx: ToolHandlerContext, tool: 'line' | 'dottedLine'): void => {
  const { canvas, startPoint, currentPoint, strokeColor, strokeWidth, senderId, onDraw } = ctx;

  const payload: Omit<StraightLinePayload, 'instanceId'> = {
    tool,
    x1: startPoint.x / canvas.width,
    y1: startPoint.y / canvas.height,
    x2: currentPoint.x / canvas.width,
    y2: currentPoint.y / canvas.height,
    color: strokeColor,
    strokeWidth,
    dashPattern: tool === TOOLS.DOTTED_LINE ? [strokeWidth * 2, strokeWidth * 2] : undefined,
  };
  onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
};

/**
 * Handler for arrow tool.
 * Creates an arrow with arrowhead.
 */
const handleArrow: ToolPointerUpHandler = (ctx) => {
  const { canvas, startPoint, currentPoint, strokeColor, strokeWidth, senderId, onDraw } = ctx;

  const payload: Omit<ArrowPayload, 'instanceId'> = {
    tool: TOOLS.ARROW,
    x1: startPoint.x / canvas.width,
    y1: startPoint.y / canvas.height,
    x2: currentPoint.x / canvas.width,
    y2: currentPoint.y / canvas.height,
    color: strokeColor,
    strokeWidth,
  };
  onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
};

/**
 * Handler for text tool.
 * Opens text input overlay for the drawn area.
 */
const handleText: ToolPointerUpHandler = (ctx) => {
  const { canvas, startPoint, currentPoint, isShapeSizeValid, onTextInputRequest } = ctx;

  const rectWidth = Math.abs(currentPoint.x - startPoint.x) / canvas.width;
  const rectHeight = Math.abs(currentPoint.y - startPoint.y) / canvas.height;
  const minSize = 0.02; // Minimum text box size threshold

  if (!isShapeSizeValid(rectWidth, rectHeight) || rectWidth < minSize || rectHeight < minSize) {
    return;
  }

  const pixelX = Math.min(startPoint.x, currentPoint.x);
  const pixelY = Math.min(startPoint.y, currentPoint.y);
  const pixelWidth = Math.abs(currentPoint.x - startPoint.x);
  const pixelHeight = Math.abs(currentPoint.y - startPoint.y);

  onTextInputRequest?.(pixelX, pixelY, pixelWidth, pixelHeight);
};

// =============================================================================
// TOOL HANDLER MAP
// =============================================================================

/**
 * Map of tool types to their pointer up handlers.
 * Using a map instead of if-else chain for better maintainability and extensibility.
 */
const createToolHandlerMap = () => {
  const handlers: Record<Tool, (ctx: ToolHandlerContext) => void> = {
    [TOOLS.BRUSH]: (ctx) => handleBrushOrEraser(ctx, 'brush'),
    [TOOLS.ERASER]: (ctx) => handleBrushOrEraser(ctx, 'eraser'),
    [TOOLS.SQUARE]: handleSquare,
    [TOOLS.RECTANGLE]: handleRectangle,
    [TOOLS.CIRCLE]: handleCircle,
    [TOOLS.TRIANGLE]: handleTriangle,
    [TOOLS.PENTAGON]: (ctx) => handlePolygon(ctx, 'pentagon'),
    [TOOLS.HEXAGON]: (ctx) => handlePolygon(ctx, 'hexagon'),
    [TOOLS.STAR]: handleStar,
    [TOOLS.LINE]: (ctx) => handleLine(ctx, 'line'),
    [TOOLS.DOTTED_LINE]: (ctx) => handleLine(ctx, 'dottedLine'),
    [TOOLS.ARROW]: handleArrow,
    [TOOLS.TEXT]: handleText,
    [TOOLS.COLOR_PICKER]: () => {}, // No-op for color picker
    [TOOLS.RECOLOR]: () => {}, // No-op - handled by selection system
    [TOOLS.DOWNLOAD]: () => {}, // No-op - handled externally
  };
  return handlers;
};

// =============================================================================
// HOOK
// =============================================================================

/**
 * Custom hook that manages comprehensive drawing tool implementations for collaborative canvas operations.
 * This hook provides the core drawing functionality for all canvas tools including brushes, shapes, lines,
 * and text input areas. It handles the complex logic for converting canvas interactions into drawing actions
 * with proper coordinate normalization, validation, and optimization.
 *
 * Uses a handler map pattern instead of if-else chains for better maintainability and extensibility.
 *
 * @param canvasRef - Reference to the HTML canvas element for coordinate calculations and validation
 * @param tool - Currently active drawing tool that determines action generation behavior
 * @param strokeWidth - Width setting for strokes and shape borders in drawing actions
 * @param strokeColor - Color setting for all drawing operations and action payloads
 * @param onDraw - Callback function for submitting generated drawing actions to the collaboration system
 * @param senderId - Unique identifier for the current user session for action attribution
 * @param drawingState - Object containing current path data and drawing state for brush/eraser tools
 * @param isShapeSizeValid - Validation function for ensuring shape dimensions meet minimum requirements
 * @param isRadiusValid - Validation function for ensuring circular shape radii meet minimum requirements
 * @param onTextInputRequest - Optional callback for initiating text input overlay when using text tool
 * @returns Object containing mouse event handlers for tool-specific drawing operations
 */
export const useDrawingTools = ({
  canvasRef,
  tool,
  strokeWidth,
  strokeColor,
  onDraw,
  senderId,
  drawingState,
  isShapeSizeValid,
  isRadiusValid,
  onTextInputRequest,
}: UseDrawingToolsProps) => {
  const { currentPath } = drawingState;

  // Memoize the handler map to avoid recreating on every render
  const toolHandlers = useMemo(() => createToolHandlerMap(), []);

  const handleToolPointerDown = useCallback(
    (eventData: CanvasEventData) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      // Initialize path for brush/eraser tools
      if (tool === TOOLS.BRUSH || tool === TOOLS.ERASER) {
        currentPath.current = [
          {
            x: eventData.startPoint.x / canvas.width,
            y: eventData.startPoint.y / canvas.height,
          },
        ];
      }
    },
    [canvasRef, tool, currentPath],
  );

  const handleToolPointerMove = useCallback(
    (eventData: CanvasEventData) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      // Add points to path for brush/eraser tools
      if (tool === TOOLS.BRUSH || tool === TOOLS.ERASER) {
        currentPath.current.push({
          x: eventData.currentPoint.x / canvas.width,
          y: eventData.currentPoint.y / canvas.height,
        });
      }
    },
    [canvasRef, tool, currentPath],
  );

  const handleToolPointerUp = useCallback(
    (eventData: CanvasEventData) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const { startPoint, currentPoint } = eventData;

      // Create handler context with all required data
      const ctx: ToolHandlerContext = {
        canvas,
        startPoint,
        currentPoint,
        strokeColor,
        strokeWidth,
        senderId,
        onDraw,
        isShapeSizeValid,
        isRadiusValid,
        onTextInputRequest,
        currentPath,
      };

      // Execute the appropriate tool handler from the map
      const handler = toolHandlers[tool];
      if (handler) {
        handler(ctx);
      }

      // Clear the current path after any tool operation
      currentPath.current = [];
    },
    [
      canvasRef,
      tool,
      strokeWidth,
      strokeColor,
      onDraw,
      senderId,
      currentPath,
      isShapeSizeValid,
      isRadiusValid,
      onTextInputRequest,
      toolHandlers,
    ],
  );

  return {
    handleToolPointerDown,
    handleToolPointerMove,
    handleToolPointerUp,
  };
};
