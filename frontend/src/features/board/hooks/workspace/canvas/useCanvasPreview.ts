import { useCallback, useRef } from 'react';

import { TOOLS } from 'features/board/constants/BoardConstants';
import type { Point } from 'features/board/types/BoardObjectTypes';
import type { Tool } from 'shared/types/CommonTypes';

import type { CanvasEventData } from './useCanvasEvents';

interface UseCanvasPreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  contextRef: React.RefObject<CanvasRenderingContext2D | null>;
  tool: Tool;
  strokeWidth: number;
  strokeColor: string;
  currentPath: React.RefObject<Point[]>;
}

export const useCanvasPreview = ({
  canvasRef,
  contextRef,
  tool,
  strokeWidth,
  strokeColor,
  currentPath,
}: UseCanvasPreviewProps) => {
  const originalImageData = useRef<ImageData | null>(null);

  const saveCanvasState = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) { return; }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    originalImageData.current = imageData;
  }, [canvasRef, contextRef]);

  const restoreCanvasState = useCallback(() => {
    const ctx = contextRef.current;
    if (!ctx || !originalImageData.current) { return; }

    ctx.putImageData(originalImageData.current, 0, 0);
  }, [contextRef]);

  const clearPreviewState = useCallback(() => {
    originalImageData.current = null;
  }, []);

  const setupCanvasStyle = useCallback((ctx: CanvasRenderingContext2D, alpha = 0.8) => {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = alpha;
  }, [strokeColor, strokeWidth]);

  const renderBrushPreview = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (currentPath.current.length <= 1) { return; }

    ctx.globalCompositeOperation = tool === TOOLS.ERASER ? 'destination-out' : 'source-over';

    ctx.beginPath();
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
  }, [currentPath, tool]);

  const renderShapePreview = useCallback(
    (ctx: CanvasRenderingContext2D, startPoint: Point, currentPoint: Point) => {
      if (tool === TOOLS.SQUARE) {
        const width = currentPoint.x - startPoint.x;
        const height = currentPoint.y - startPoint.y;
        const size = Math.max(Math.abs(width), Math.abs(height));
        const squareWidth = width < 0 ? -size : size;
        const squareHeight = height < 0 ? -size : size;

        ctx.strokeRect(startPoint.x, startPoint.y, squareWidth, squareHeight);
      } else if (tool === TOOLS.RECTANGLE) {
        ctx.strokeRect(
          startPoint.x,
          startPoint.y,
          currentPoint.x - startPoint.x,
          currentPoint.y - startPoint.y,
        );
      } else if (tool === TOOLS.CIRCLE) {
        const radius = Math.sqrt(
          Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2),
        );
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (tool === TOOLS.TRIANGLE) {
        const width = currentPoint.x - startPoint.x;
        const height = currentPoint.y - startPoint.y;
        ctx.beginPath();
        ctx.moveTo(startPoint.x + width / 2, startPoint.y);
        ctx.lineTo(startPoint.x, startPoint.y + height);
        ctx.lineTo(startPoint.x + width, startPoint.y + height);
        ctx.closePath();
        ctx.stroke();
      } else if (tool === TOOLS.PENTAGON || tool === TOOLS.HEXAGON) {
        const radius = Math.sqrt(
          Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2),
        );
        const sides = tool === TOOLS.PENTAGON ? 5 : 6;
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
          const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
          const x = startPoint.x + radius * Math.cos(angle);
          const y = startPoint.y + radius * Math.sin(angle);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      } else if (tool === TOOLS.STAR) {
        const radius = Math.sqrt(
          Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2),
        );
        const innerRadius = radius * 0.4;
        const points = 5;
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
          const angle = (i * Math.PI) / points - Math.PI / 2;
          const r = i % 2 === 0 ? radius : innerRadius;
          const x = startPoint.x + r * Math.cos(angle);
          const y = startPoint.y + r * Math.sin(angle);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      } else if (tool === TOOLS.LINE || tool === TOOLS.DOTTED_LINE) {
        if (tool === TOOLS.DOTTED_LINE) {
          ctx.setLineDash([strokeWidth * 2, strokeWidth * 2]);
        }
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.stroke();
        if (tool === TOOLS.DOTTED_LINE) {
          ctx.setLineDash([]);
        }
      } else if (tool === TOOLS.ARROW) {
        const angle = Math.atan2(currentPoint.y - startPoint.y, currentPoint.x - startPoint.x);
        const lineLength = Math.sqrt(
          Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2),
        );

        const arrowLength = Math.max(strokeWidth * 3, Math.min(strokeWidth * 6, lineLength * 0.15));
        const arrowWidth = arrowLength * 0.6;
        const arrowAngle = Math.atan(arrowWidth / arrowLength);

        const lineEndX = currentPoint.x - (arrowLength * 0.3) * Math.cos(angle);
        const lineEndY = currentPoint.y - (arrowLength * 0.3) * Math.sin(angle);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw line
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(lineEndX, lineEndY);
        ctx.stroke();

        // Draw arrowhead
        const arrowPoint1X = currentPoint.x - arrowLength * Math.cos(angle - arrowAngle);
        const arrowPoint1Y = currentPoint.y - arrowLength * Math.sin(angle - arrowAngle);
        const arrowPoint2X = currentPoint.x - arrowLength * Math.cos(angle + arrowAngle);
        const arrowPoint2Y = currentPoint.y - arrowLength * Math.sin(angle + arrowAngle);

        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.moveTo(currentPoint.x, currentPoint.y);
        ctx.lineTo(arrowPoint1X, arrowPoint1Y);
        ctx.lineTo(arrowPoint2X, arrowPoint2Y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = Math.max(1, strokeWidth * 0.5);
        ctx.stroke();
      } else if (tool === TOOLS.TEXT) {
        // Text preview with dashed border and semi-transparent fill
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(
          startPoint.x,
          startPoint.y,
          currentPoint.x - startPoint.x,
          currentPoint.y - startPoint.y,
        );
        ctx.setLineDash([]);

        ctx.fillStyle = `${strokeColor}20`;
        ctx.fillRect(
          startPoint.x,
          startPoint.y,
          currentPoint.x - startPoint.x,
          currentPoint.y - startPoint.y,
        );
      }
    },
    [tool, strokeWidth, strokeColor],
  );

  const renderPreview = useCallback(
    (eventData: CanvasEventData) => {
      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      if (!canvas || !ctx || !originalImageData.current) { return; }

      // Restore original state
      restoreCanvasState();

      // Set up preview style
      setupCanvasStyle(ctx, 0.8);
      const originalAlpha = ctx.globalAlpha;

      if (tool === TOOLS.BRUSH || tool === TOOLS.ERASER) {
        renderBrushPreview(ctx, canvas);
      } else {
        renderShapePreview(ctx, eventData.startPoint, eventData.currentPoint);
      }

      // Restore original alpha
      ctx.globalAlpha = originalAlpha;
    },
    [canvasRef, contextRef, tool, restoreCanvasState, setupCanvasStyle, renderBrushPreview, renderShapePreview],
  );

  const handlePreviewStart = useCallback((eventData: CanvasEventData) => {
    const ctx = contextRef.current;
    if (!ctx) { return; }

    saveCanvasState();

    // Set up canvas context for drawing tools
    setupCanvasStyle(ctx, 1.0);

    if (tool === TOOLS.BRUSH || tool === TOOLS.ERASER) {
      ctx.globalCompositeOperation = tool === TOOLS.ERASER ? 'destination-out' : 'source-over';
      ctx.beginPath();
      ctx.moveTo(eventData.startPoint.x, eventData.startPoint.y);
    }
  }, [contextRef, saveCanvasState, setupCanvasStyle, tool]);

  const handlePreviewMove = useCallback(
    (eventData: CanvasEventData) => {
      renderPreview(eventData);
    },
    [renderPreview],
  );

  const handlePreviewEnd = useCallback(() => {
    restoreCanvasState();
    clearPreviewState();
  }, [restoreCanvasState, clearPreviewState]);

  return {
    handlePreviewStart,
    handlePreviewMove,
    handlePreviewEnd,
  };
};