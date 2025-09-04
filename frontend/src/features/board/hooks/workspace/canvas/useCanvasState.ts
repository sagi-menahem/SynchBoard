import type { ActionPayload, Point } from 'features/board/types/BoardObjectTypes';
import type { CanvasConfig } from 'features/board/types/BoardTypes';
import {
  drawCirclePayload,
  drawLinePayload,
  drawPolygonPayload,
  drawRectanglePayload,
  drawTextPayload,
  drawTrianglePayload,
  getMouseCoordinates,
  isRadiusValid,
  isShapeSizeValid,
  replayDrawAction,
  setupCanvasContext,
} from 'features/board/utils/CanvasUtils';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCanvasStateProps {
  objects: ActionPayload[];
  canvasConfig?: CanvasConfig;
}

export const useCanvasState = ({ objects, canvasConfig }: UseCanvasStateProps) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const startPoint = useRef<Point | null>(null);
  const currentPath = useRef<Point[]>([]);

  const resetDrawingState = useCallback(() => {
    setIsDrawing(false);
    startPoint.current = null;
    currentPath.current = [];
  }, []);

  const setCanvasDimensions = useCallback((width: number, height: number) => {
    setDimensions({ width, height });
  }, []);

  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0 && canvasRef.current && !contextRef.current) {
      contextRef.current = setupCanvasContext(canvasRef.current);
    }
  }, [dimensions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;

    if (!canvas || !ctx || dimensions.width === 0 || dimensions.height === 0) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects.forEach((obj) => replayDrawAction(obj, ctx, canvas!));
  }, [objects, dimensions]);

  useEffect(() => {
    if (canvasConfig) {
      setCanvasDimensions(canvasConfig.width, canvasConfig.height);
    }
  }, [canvasConfig, setCanvasDimensions]);

  return {
    canvasRef,
    containerRef,
    contextRef,

    dimensions,
    isDrawing,
    setIsDrawing,
    startPoint,
    currentPath,

    resetDrawingState,
    setCanvasDimensions,

    replayDrawAction,
    drawLinePayload,
    drawRectanglePayload,
    drawCirclePayload,
    drawTrianglePayload,
    drawPolygonPayload,
    drawTextPayload,
    setupCanvasContext,
    getMouseCoordinates,
    isShapeSizeValid,
    isRadiusValid,
  };
};
