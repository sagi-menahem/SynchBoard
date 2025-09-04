
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

  const handleToolMouseDown = useCallback(
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

  const handleToolMouseMove = useCallback(
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

  const handleToolMouseUp = useCallback(
    (eventData: CanvasEventData) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const { startPoint, currentPoint } = eventData;

      if ((tool === TOOLS.BRUSH || tool === TOOLS.ERASER) && currentPath.current.length > 1) {
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

        const squareX = width < 0 ? startPoint.x - size : startPoint.x;
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
        const rectX = Math.min(startPoint.x, currentPoint.x) / canvas.width;
        const rectY = Math.min(startPoint.y, currentPoint.y) / canvas.height;
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
            x1: (startPoint.x + (currentPoint.x - startPoint.x) / 2) / canvas.width,
            y1: startPoint.y / canvas.height,
            x2: startPoint.x / canvas.width,
            y2: currentPoint.y / canvas.height,
            x3: currentPoint.x / canvas.width,
            y3: currentPoint.y / canvas.height,
            color: strokeColor,
            strokeWidth,
          };
          onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
        }
      } else if (tool === TOOLS.PENTAGON || tool === TOOLS.HEXAGON) {
        const pixelRadius = Math.sqrt(
          Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2),
        );
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
        const pixelRadius = Math.sqrt(
          Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2),
        );
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
        const minSize = 0.02; // 2% of canvas dimension

        if (
          isShapeSizeValid(rectWidth, rectHeight) &&
          rectWidth >= minSize &&
          rectHeight >= minSize
        ) {
          const pixelX = Math.min(startPoint.x, currentPoint.x);
          const pixelY = Math.min(startPoint.y, currentPoint.y);
          const pixelWidth = Math.abs(currentPoint.x - startPoint.x);
          const pixelHeight = Math.abs(currentPoint.y - startPoint.y);

          onTextInputRequest?.(pixelX, pixelY, pixelWidth, pixelHeight);
        }
      }

      // Clean up drawing state
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
    handleToolMouseDown,
    handleToolMouseMove,
    handleToolMouseUp,
  };
};
