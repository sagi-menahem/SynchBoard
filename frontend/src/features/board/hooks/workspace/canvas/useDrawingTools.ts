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
import { useCallback } from 'react';
import type { Tool } from 'shared/types/CommonTypes';

import type { CanvasEventData } from './useCanvasEvents';

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

/**
 * Custom hook that manages comprehensive drawing tool implementations for collaborative canvas operations.
 * This hook provides the core drawing functionality for all canvas tools including brushes, shapes, lines,
 * and text input areas. It handles the complex logic for converting canvas interactions into drawing actions
 * with proper coordinate normalization, validation, and optimization. The hook manages tool-specific behaviors
 * including path optimization for brush and eraser tools, geometric calculations for shapes and polygons,
 * and coordinate transformations for consistent cross-device collaboration. It integrates validation functions
 * to ensure drawing quality and provides specialized handling for different tool types while maintaining
 * consistent action format for the collaboration system.
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

  const handleToolPointerDown = useCallback(
    (eventData: CanvasEventData) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

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

      if ((tool === TOOLS.BRUSH || tool === TOOLS.ERASER) && currentPath.current.length > 1) {
        // Need at least 2 points for a valid stroke
        const optimizedPoints = optimizeDrawingPoints([...currentPath.current]);

        const payload: Omit<LinePayload, 'instanceId'> = {
          tool: tool as 'brush' | 'eraser',
          points: optimizedPoints,
          color: strokeColor,
          lineWidth: strokeWidth,
        };
        onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
      } else if (tool === TOOLS.SQUARE) {
        const width = currentPoint.x - startPoint.x;
        const height = currentPoint.y - startPoint.y;
        const size = Math.max(Math.abs(width), Math.abs(height));

        // Adjust X position when dragging left to maintain square origin from correct corner
        const squareX = width < 0 ? startPoint.x - size : startPoint.x;
        // Adjust Y position when dragging up to maintain square origin from correct corner
        const squareY = height < 0 ? startPoint.y - size : startPoint.y;

        const normalizedX = squareX / canvas.width;
        const normalizedY = squareY / canvas.height;
        const normalizedWidth = size / canvas.width;
        const normalizedHeight = size / canvas.height;

        if (isShapeSizeValid(normalizedWidth, normalizedHeight)) {
          const payload: Omit<RectanglePayload, 'instanceId'> = {
            tool,
            x: normalizedX,
            y: normalizedY,
            width: normalizedWidth,
            height: normalizedHeight,
            color: strokeColor,
            strokeWidth,
          };
          onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
        }
      } else if (tool === TOOLS.RECTANGLE) {
        // Calculate top-left corner by taking minimum coordinates (handles drag in any direction)
        const rectX = Math.min(startPoint.x, currentPoint.x) / canvas.width;
        const rectY = Math.min(startPoint.y, currentPoint.y) / canvas.height;
        // Calculate absolute dimensions regardless of drag direction
        const rectWidth = Math.abs(currentPoint.x - startPoint.x) / canvas.width;
        const rectHeight = Math.abs(currentPoint.y - startPoint.y) / canvas.height;

        if (isShapeSizeValid(rectWidth, rectHeight)) {
          const payload: Omit<RectanglePayload, 'instanceId'> = {
            tool,
            x: rectX,
            y: rectY,
            width: rectWidth,
            height: rectHeight,
            color: strokeColor,
            strokeWidth,
          };
          onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
        }
      } else if (tool === TOOLS.CIRCLE) {
        // Calculate radius using Euclidean distance formula from center to current mouse position
        const radius =
          Math.sqrt(
            Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2),
          ) / canvas.width;

        if (isRadiusValid(radius)) {
          const payload: Omit<CirclePayload, 'instanceId'> = {
            tool,
            x: startPoint.x / canvas.width,
            y: startPoint.y / canvas.height,
            radius,
            color: strokeColor,
            strokeWidth,
          };
          onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
        }
      } else if (tool === TOOLS.TRIANGLE) {
        const width = Math.abs(currentPoint.x - startPoint.x) / canvas.width;
        const height = Math.abs(currentPoint.y - startPoint.y) / canvas.height;

        if (isShapeSizeValid(width, height)) {
          const payload: Omit<TrianglePayload, 'instanceId'> = {
            tool,
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
        }
      } else if (tool === TOOLS.PENTAGON || tool === TOOLS.HEXAGON) {
        // Calculate radius in pixels using Euclidean distance from center to mouse position
        const pixelRadius = Math.sqrt(
          Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2),
        );
        // Normalize radius relative to smaller dimension to maintain proportions across canvas sizes
        const normalizedRadius = pixelRadius / Math.min(canvas.width, canvas.height);

        if (isRadiusValid(normalizedRadius)) {
          const sides = tool === TOOLS.PENTAGON ? 5 : 6;
          const payload: Omit<PolygonPayload, 'instanceId'> = {
            tool: tool as 'pentagon' | 'hexagon' | 'star',
            x: startPoint.x / canvas.width,
            y: startPoint.y / canvas.height,
            radius: normalizedRadius,
            sides,
            color: strokeColor,
            strokeWidth,
          };
          onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
        }
      } else if (tool === TOOLS.STAR) {
        // Calculate radius in pixels using Euclidean distance from center to mouse position
        const pixelRadius = Math.sqrt(
          Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2),
        );
        // Normalize radius relative to smaller dimension for consistent star proportions
        const normalizedRadius = pixelRadius / Math.min(canvas.width, canvas.height);

        if (isRadiusValid(normalizedRadius)) {
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
        }
      } else if (tool === TOOLS.LINE || tool === TOOLS.DOTTED_LINE) {
        const payload: Omit<StraightLinePayload, 'instanceId'> = {
          tool: tool as 'line' | 'dottedLine',
          x1: startPoint.x / canvas.width,
          y1: startPoint.y / canvas.height,
          x2: currentPoint.x / canvas.width,
          y2: currentPoint.y / canvas.height,
          color: strokeColor,
          strokeWidth,
          // Create dash pattern with gaps proportional to stroke width for visual consistency
          dashPattern: tool === TOOLS.DOTTED_LINE ? [strokeWidth * 2, strokeWidth * 2] : undefined,
        };
        onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
      } else if (tool === TOOLS.ARROW) {
        const payload: Omit<ArrowPayload, 'instanceId'> = {
          tool,
          x1: startPoint.x / canvas.width,
          y1: startPoint.y / canvas.height,
          x2: currentPoint.x / canvas.width,
          y2: currentPoint.y / canvas.height,
          color: strokeColor,
          strokeWidth,
        };
        onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
      } else if (tool === TOOLS.TEXT) {
        const rectWidth = Math.abs(currentPoint.x - startPoint.x) / canvas.width;
        const rectHeight = Math.abs(currentPoint.y - startPoint.y) / canvas.height;
        const minSize = 0.02; // Minimum text box size threshold for usable text input areas

        if (
          isShapeSizeValid(rectWidth, rectHeight) &&
          rectWidth >= minSize &&
          rectHeight >= minSize
        ) {
          // Calculate text box bounds in pixel coordinates (top-left origin with positive dimensions)
          const pixelX = Math.min(startPoint.x, currentPoint.x);
          const pixelY = Math.min(startPoint.y, currentPoint.y);
          const pixelWidth = Math.abs(currentPoint.x - startPoint.x);
          const pixelHeight = Math.abs(currentPoint.y - startPoint.y);

          onTextInputRequest?.(pixelX, pixelY, pixelWidth, pixelHeight);
        }
      }

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
    ],
  );

  return {
    handleToolPointerDown,
    handleToolPointerMove,
    handleToolPointerUp,
  };
};
