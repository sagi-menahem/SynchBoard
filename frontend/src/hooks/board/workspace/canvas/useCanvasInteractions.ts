import { useCallback, useEffect, useRef } from 'react';

import { optimizeDrawingPoints } from 'utils';

import { CANVAS_CONFIG, TOOLS } from 'constants/BoardConstants';
import { useConnectionStatus } from 'hooks/common';
import {
  ActionType,
  type CirclePayload,
  type LinePayload,
  type RectanglePayload,
  type TrianglePayload,
  type PolygonPayload,
  type SendBoardActionRequest,
} from 'types/BoardObjectTypes';
import type { Tool } from 'types/CommonTypes';

import type { DrawingState } from './useCanvasCore';

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
}: UseCanvasInteractionsProps) => {
  const { isDrawing, setIsDrawing, startPoint, currentPath } = drawingState;
  const { shouldBlockFunctionality } = useConnectionStatus();

  // Store original canvas data for preview restoration
  const originalImageData = useRef<ImageData | null>(null);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      let ctx = contextRef.current;
      
      // If canvas exists but context doesn't, initialize it
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

      // Store the current canvas state for preview restoration
      originalImageData.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      setIsDrawing(true);
      const { offsetX, offsetY } = event.nativeEvent;

      if (tool === TOOLS.BRUSH || tool === TOOLS.ERASER) {
        currentPath.current = [{ x: offsetX / canvas.width, y: offsetY / canvas.height }];
      } else if (
        tool === TOOLS.RECTANGLE || 
        tool === TOOLS.CIRCLE || 
        tool === TOOLS.TRIANGLE || 
        tool === TOOLS.PENTAGON || 
        tool === TOOLS.HEXAGON
      ) {
        startPoint.current = { x: offsetX, y: offsetY };
      } else if (tool === TOOLS.COLOR_PICKER) {
        // Handle color picker immediately
        const imageData = ctx.getImageData(offsetX, offsetY, 1, 1);
        const data = imageData.data;
        const hex = `#${((1 << 24) + (data[0] << 16) + (data[1] << 8) + data[2]).toString(16).slice(1)}`;
        // This would need to be passed up to parent component to update color
        console.log('Color picked:', hex);
      } else if (tool === TOOLS.FILL) {
        // Simple flood fill implementation would go here
        console.log('Fill tool clicked at:', offsetX, offsetY);
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

      // Restore original canvas state
      ctx.putImageData(originalImageData.current, 0, 0);
      
      // Draw preview on top
      ctx.lineWidth = strokeWidth;
      ctx.globalCompositeOperation = CANVAS_CONFIG.COMPOSITE_OPERATIONS.DRAW;
      ctx.strokeStyle = tool === TOOLS.ERASER ? CANVAS_CONFIG.PREVIEW_ERASER_COLOR : strokeColor;
      
      // Make preview slightly transparent to distinguish from final
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
      }
      
      // Restore original alpha
      ctx.globalAlpha = originalAlpha;
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (!isDrawing || !originalImageData.current) return;
      setIsDrawing(false);
      const coords = getMouseCoordinates(event, canvas);
      if (!canvas || !ctx || !coords) return;

      // Restore original canvas state (removes preview)
      ctx.putImageData(originalImageData.current, 0, 0);
      originalImageData.current = null;

      if ((tool === TOOLS.BRUSH || tool === TOOLS.ERASER) && currentPath.current.length > 1) {
        // Optimize points for network efficiency while maintaining visual quality
        const optimizedPoints = optimizeDrawingPoints([...currentPath.current]);
        
        const payload: Omit<LinePayload, 'instanceId'> = {
          tool,
          points: optimizedPoints,
          color: strokeColor,
          lineWidth: strokeWidth,
        };
        onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
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
        const radius =
          Math.sqrt(
            Math.pow(coords.x - startPoint.current.x, 2) + Math.pow(coords.y - startPoint.current.y, 2),
          ) / canvas.width;
        if (isRadiusValid(radius)) {
          const sides = tool === TOOLS.PENTAGON ? 5 : 6;
          const payload: Omit<PolygonPayload, 'instanceId'> = {
            tool,
            x: startPoint.current.x / canvas.width,
            y: startPoint.current.y / canvas.height,
            radius,
            sides,
            color: strokeColor,
            strokeWidth,
          };
          onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
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
  ]);

  return {
    handleMouseDown,
    isDrawing,
  };
};