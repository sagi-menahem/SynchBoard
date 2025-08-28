import { useCallback, useEffect, useRef } from 'react';

import { Logger, optimizeDrawingPoints } from 'utils';

import { CANVAS_CONFIG, TOOLS } from 'constants/BoardConstants';
import { useConnectionStatus } from 'hooks/common/useConnectionStatus';
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
} from 'types/BoardObjectTypes';
import type { Tool } from 'types/CommonTypes';

export interface DrawingState {
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  startPoint: React.RefObject<Point | null>;
  currentPath: React.RefObject<Point[]>;
  resetDrawingState: () => void;
}

interface UseCanvasInteractionsProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  contextRef: React.RefObject<CanvasRenderingContext2D | null>;
  tool: Tool;
  strokeWidth: number;
  strokeColor: string;
  onDraw: (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => void;
  senderId: string;
  drawingState: DrawingState;
  getMouseCoordinates: (event: MouseEvent, canvas: HTMLCanvasElement) => { x: number; y: number } | null;
  isShapeSizeValid: (width: number, height: number) => boolean;
  isRadiusValid: (radius: number) => boolean;
  onTextInputRequest?: (x: number, y: number, width: number, height: number) => void;
}

export const useCanvasInteractions = ({
  canvasRef,
  contextRef,
  tool,
  strokeWidth,
  strokeColor,
  onDraw,
  senderId,
  drawingState,
  getMouseCoordinates,
  isShapeSizeValid,
  isRadiusValid,
  onTextInputRequest,
}: UseCanvasInteractionsProps) => {
  const { isDrawing, setIsDrawing, startPoint, currentPath } = drawingState;
  const { shouldBlockFunctionality } = useConnectionStatus();

  const originalImageData = useRef<ImageData | null>(null);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      let ctx = contextRef.current;

      if (canvas && !ctx) {
        ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          contextRef.current = ctx;
        }
      }

      if (!canvas || !ctx) return;

      if (shouldBlockFunctionality) {
        return;
      }

      originalImageData.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

      setIsDrawing(true);
      const { offsetX, offsetY } = event.nativeEvent;

      if (tool === TOOLS.BRUSH || tool === TOOLS.ERASER) {
        currentPath.current = [{ x: offsetX / canvas.width, y: offsetY / canvas.height }];
      } else if (
        tool === TOOLS.SQUARE ||
        tool === TOOLS.RECTANGLE ||
        tool === TOOLS.CIRCLE ||
        tool === TOOLS.TRIANGLE ||
        tool === TOOLS.PENTAGON ||
        tool === TOOLS.HEXAGON ||
        tool === TOOLS.STAR ||
        tool === TOOLS.LINE ||
        tool === TOOLS.DOTTED_LINE ||
        tool === TOOLS.ARROW ||
        tool === TOOLS.TEXT
      ) {
        startPoint.current = { x: offsetX, y: offsetY };
      } else if (tool === TOOLS.COLOR_PICKER) {
        const imageData = ctx.getImageData(offsetX, offsetY, 1, 1);
        const data = imageData.data;
        const hex = `#${((1 << 24) + (data[0] << 16) + (data[1] << 8) + data[2]).toString(16).slice(1)}`;
        Logger.debug('Color picked:', hex);
      } else if (tool === TOOLS.RECOLOR) {
        // Recolor logic is now handled in Canvas.tsx through handleCanvasClick
        Logger.debug('Recolor tool mouse down at:', offsetX, offsetY);
      }
    },
    [tool, canvasRef, contextRef, setIsDrawing, startPoint, currentPath, shouldBlockFunctionality],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDrawing || !originalImageData.current) return;
      const coords = getMouseCoordinates(event, canvas);
      if (!coords) return;

      ctx.putImageData(originalImageData.current, 0, 0);

      ctx.lineWidth = strokeWidth;
      ctx.globalCompositeOperation = CANVAS_CONFIG.COMPOSITE_OPERATIONS.DRAW;
      ctx.strokeStyle = tool === TOOLS.ERASER ? CANVAS_CONFIG.PREVIEW_ERASER_COLOR : strokeColor;

      const originalAlpha = ctx.globalAlpha;
      ctx.globalAlpha = 0.7;

      if (tool === TOOLS.BRUSH || tool === TOOLS.ERASER) {
        currentPath.current.push({ x: coords.x / canvas.width, y: coords.y / canvas.height });
        ctx.beginPath();
        if (currentPath.current.length > 1) {
          ctx.moveTo(
            currentPath.current[0].x * canvas.width,
            currentPath.current[0].y * canvas.height,
          );
          for (let i = 1; i < currentPath.current.length; i++) {
            ctx.lineTo(
              currentPath.current[i].x * canvas.width,
              currentPath.current[i].y * canvas.height,
            );
          }
          ctx.stroke();
        }
      } else if (tool === TOOLS.SQUARE && startPoint.current) {
        const width = coords.x - startPoint.current.x;
        const height = coords.y - startPoint.current.y;
        const size = Math.max(Math.abs(width), Math.abs(height));
        const squareWidth = width < 0 ? -size : size;
        const squareHeight = height < 0 ? -size : size;
        ctx.strokeRect(
          startPoint.current.x,
          startPoint.current.y,
          squareWidth,
          squareHeight,
        );
      } else if (tool === TOOLS.RECTANGLE && startPoint.current) {
        ctx.strokeRect(
          startPoint.current.x,
          startPoint.current.y,
          coords.x - startPoint.current.x,
          coords.y - startPoint.current.y,
        );
      } else if (tool === TOOLS.CIRCLE && startPoint.current) {
        const radius = Math.sqrt(
          Math.pow(coords.x - startPoint.current.x, 2) + Math.pow(coords.y - startPoint.current.y, 2),
        );
        ctx.beginPath();
        ctx.arc(startPoint.current.x, startPoint.current.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (tool === TOOLS.TRIANGLE && startPoint.current) {
        const width = coords.x - startPoint.current.x;
        const height = coords.y - startPoint.current.y;
        ctx.beginPath();
        ctx.moveTo(startPoint.current.x + width / 2, startPoint.current.y);
        ctx.lineTo(startPoint.current.x, startPoint.current.y + height);
        ctx.lineTo(startPoint.current.x + width, startPoint.current.y + height);
        ctx.closePath();
        ctx.stroke();
      } else if ((tool === TOOLS.PENTAGON || tool === TOOLS.HEXAGON) && startPoint.current) {
        const radius = Math.sqrt(
          Math.pow(coords.x - startPoint.current.x, 2) + Math.pow(coords.y - startPoint.current.y, 2),
        );
        const sides = tool === TOOLS.PENTAGON ? 5 : 6;
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
          const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
          const x = startPoint.current.x + radius * Math.cos(angle);
          const y = startPoint.current.y + radius * Math.sin(angle);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      } else if (tool === TOOLS.STAR && startPoint.current) {
        const radius = Math.sqrt(
          Math.pow(coords.x - startPoint.current.x, 2) + Math.pow(coords.y - startPoint.current.y, 2),
        );
        const innerRadius = radius * 0.4;
        const points = 5;
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
          const angle = (i * Math.PI) / points - Math.PI / 2;
          const r = i % 2 === 0 ? radius : innerRadius;
          const x = startPoint.current.x + r * Math.cos(angle);
          const y = startPoint.current.y + r * Math.sin(angle);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      } else if ((tool === TOOLS.LINE || tool === TOOLS.DOTTED_LINE) && startPoint.current) {
        if (tool === TOOLS.DOTTED_LINE) {
          ctx.setLineDash([strokeWidth * 2, strokeWidth * 2]);
        }
        ctx.beginPath();
        ctx.moveTo(startPoint.current.x, startPoint.current.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        if (tool === TOOLS.DOTTED_LINE) {
          ctx.setLineDash([]);
        }
      } else if (tool === TOOLS.ARROW && startPoint.current) {
        const angle = Math.atan2(coords.y - startPoint.current.y, coords.x - startPoint.current.x);
        const lineLength = Math.sqrt(
          Math.pow(coords.x - startPoint.current.x, 2) + Math.pow(coords.y - startPoint.current.y, 2),
        );

        const arrowLength = Math.max(strokeWidth * 3, Math.min(strokeWidth * 6, lineLength * 0.15));
        const arrowWidth = arrowLength * 0.6;
        const arrowAngle = Math.atan(arrowWidth / arrowLength);

        const lineEndX = coords.x - (arrowLength * 0.3) * Math.cos(angle);
        const lineEndY = coords.y - (arrowLength * 0.3) * Math.sin(angle);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(startPoint.current.x, startPoint.current.y);
        ctx.lineTo(lineEndX, lineEndY);
        ctx.stroke();

        const arrowPoint1X = coords.x - arrowLength * Math.cos(angle - arrowAngle);
        const arrowPoint1Y = coords.y - arrowLength * Math.sin(angle - arrowAngle);
        const arrowPoint2X = coords.x - arrowLength * Math.cos(angle + arrowAngle);
        const arrowPoint2Y = coords.y - arrowLength * Math.sin(angle + arrowAngle);

        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        ctx.lineTo(arrowPoint1X, arrowPoint1Y);
        ctx.lineTo(arrowPoint2X, arrowPoint2Y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = Math.max(1, strokeWidth * 0.5);
        ctx.stroke();

        ctx.lineWidth = strokeWidth;
      } else if (tool === TOOLS.TEXT && startPoint.current) {
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(
          startPoint.current.x,
          startPoint.current.y,
          coords.x - startPoint.current.x,
          coords.y - startPoint.current.y,
        );
        ctx.setLineDash([]);

        ctx.fillStyle = `${strokeColor}20`;
        ctx.fillRect(
          startPoint.current.x,
          startPoint.current.y,
          coords.x - startPoint.current.x,
          coords.y - startPoint.current.y,
        );
      }

      ctx.globalAlpha = originalAlpha;
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (!isDrawing || !originalImageData.current) return;
      setIsDrawing(false);
      const coords = getMouseCoordinates(event, canvas);
      if (!canvas || !ctx || !coords) return;

      ctx.putImageData(originalImageData.current, 0, 0);
      originalImageData.current = null;

      if ((tool === TOOLS.BRUSH || tool === TOOLS.ERASER) && currentPath.current.length > 1) {
        const optimizedPoints = optimizeDrawingPoints([...currentPath.current]);

        const payload: Omit<LinePayload, 'instanceId'> = {
          tool,
          points: optimizedPoints,
          color: strokeColor,
          lineWidth: strokeWidth,
        };
        onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
      } else if (tool === TOOLS.SQUARE && startPoint.current) {
        const width = coords.x - startPoint.current.x;
        const height = coords.y - startPoint.current.y;
        const size = Math.max(Math.abs(width), Math.abs(height));

        const squareX = width < 0 ? startPoint.current.x - size : startPoint.current.x;
        const squareY = height < 0 ? startPoint.current.y - size : startPoint.current.y;

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
      } else if (tool === TOOLS.RECTANGLE && startPoint.current) {
        const rectX = Math.min(startPoint.current.x, coords.x) / canvas.width;
        const rectY = Math.min(startPoint.current.y, coords.y) / canvas.height;
        const rectWidth = Math.abs(coords.x - startPoint.current.x) / canvas.width;
        const rectHeight = Math.abs(coords.y - startPoint.current.y) / canvas.height;
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
      } else if (tool === TOOLS.CIRCLE && startPoint.current) {
        const radius =
          Math.sqrt(
            Math.pow(coords.x - startPoint.current.x, 2) + Math.pow(coords.y - startPoint.current.y, 2),
          ) / canvas.width;
        if (isRadiusValid(radius)) {
          const payload: Omit<CirclePayload, 'instanceId'> = {
            tool,
            x: startPoint.current.x / canvas.width,
            y: startPoint.current.y / canvas.height,
            radius,
            color: strokeColor,
            strokeWidth,
          };
          onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
        }
      } else if (tool === TOOLS.TRIANGLE && startPoint.current) {
        const width = Math.abs(coords.x - startPoint.current.x) / canvas.width;
        const height = Math.abs(coords.y - startPoint.current.y) / canvas.height;
        if (isShapeSizeValid(width, height)) {
          const payload: Omit<TrianglePayload, 'instanceId'> = {
            tool,
            x1: (startPoint.current.x + (coords.x - startPoint.current.x) / 2) / canvas.width,
            y1: startPoint.current.y / canvas.height,
            x2: startPoint.current.x / canvas.width,
            y2: coords.y / canvas.height,
            x3: coords.x / canvas.width,
            y3: coords.y / canvas.height,
            color: strokeColor,
            strokeWidth,
          };
          onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
        }
      } else if ((tool === TOOLS.PENTAGON || tool === TOOLS.HEXAGON) && startPoint.current) {
        const pixelRadius = Math.sqrt(
          Math.pow(coords.x - startPoint.current.x, 2) + Math.pow(coords.y - startPoint.current.y, 2),
        );
        const normalizedRadius = pixelRadius / Math.min(canvas.width, canvas.height);
        if (isRadiusValid(normalizedRadius)) {
          const sides = tool === TOOLS.PENTAGON ? 5 : 6;
          const payload: Omit<PolygonPayload, 'instanceId'> = {
            tool,
            x: startPoint.current.x / canvas.width,
            y: startPoint.current.y / canvas.height,
            radius: normalizedRadius,
            sides,
            color: strokeColor,
            strokeWidth,
          };
          onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
        }
      } else if (tool === TOOLS.STAR && startPoint.current) {
        const pixelRadius = Math.sqrt(
          Math.pow(coords.x - startPoint.current.x, 2) + Math.pow(coords.y - startPoint.current.y, 2),
        );
        const normalizedRadius = pixelRadius / Math.min(canvas.width, canvas.height);
        if (isRadiusValid(normalizedRadius)) {
          const payload: Omit<PolygonPayload, 'instanceId'> = {
            tool: TOOLS.STAR,
            x: startPoint.current.x / canvas.width,
            y: startPoint.current.y / canvas.height,
            radius: normalizedRadius,
            sides: 5,
            color: strokeColor,
            strokeWidth,
          };
          onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
        }
      } else if ((tool === TOOLS.LINE || tool === TOOLS.DOTTED_LINE) && startPoint.current) {
        const payload: Omit<StraightLinePayload, 'instanceId'> = {
          tool,
          x1: startPoint.current.x / canvas.width,
          y1: startPoint.current.y / canvas.height,
          x2: coords.x / canvas.width,
          y2: coords.y / canvas.height,
          color: strokeColor,
          strokeWidth,
          dashPattern: tool === TOOLS.DOTTED_LINE ? [strokeWidth * 2, strokeWidth * 2] : undefined,
        };
        onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
      } else if (tool === TOOLS.ARROW && startPoint.current) {
        const payload: Omit<ArrowPayload, 'instanceId'> = {
          tool,
          x1: startPoint.current.x / canvas.width,
          y1: startPoint.current.y / canvas.height,
          x2: coords.x / canvas.width,
          y2: coords.y / canvas.height,
          color: strokeColor,
          strokeWidth,
        };
        onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
      } else if (tool === TOOLS.TEXT && startPoint.current) {
        const rectWidth = Math.abs(coords.x - startPoint.current.x) / canvas.width;
        const rectHeight = Math.abs(coords.y - startPoint.current.y) / canvas.height;

        const minSize = 0.02; // 2% of canvas dimension
        if (isShapeSizeValid(rectWidth, rectHeight) && rectWidth >= minSize && rectHeight >= minSize) {
          const pixelX = Math.min(startPoint.current.x, coords.x);
          const pixelY = Math.min(startPoint.current.y, coords.y);
          const pixelWidth = Math.abs(coords.x - startPoint.current.x);
          const pixelHeight = Math.abs(coords.y - startPoint.current.y);

          onTextInputRequest?.(pixelX, pixelY, pixelWidth, pixelHeight);
        }
      }
      currentPath.current = [];
      startPoint.current = null;
    };

    if (isDrawing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDrawing,
    tool,
    strokeWidth,
    strokeColor,
    onDraw,
    senderId,
    canvasRef,
    contextRef,
    getMouseCoordinates,
    isShapeSizeValid,
    isRadiusValid,
    setIsDrawing,
    startPoint,
    currentPath,
    onTextInputRequest,
  ]);

  return {
    handleMouseDown,
    isDrawing,
  };
};