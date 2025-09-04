
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
  // Core state
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isDrawing, setIsDrawing] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const startPoint = useRef<Point | null>(null);
  const currentPath = useRef<Point[]>([]);

  // Actions
  const resetDrawingState = useCallback(() => {
    setIsDrawing(false);
    startPoint.current = null;
    currentPath.current = [];
  }, []);

  const setCanvasDimensions = useCallback((width: number, height: number) => {
    setDimensions({ width, height });
  }, []);

  // Canvas context setup effect
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0 && canvasRef.current && !contextRef.current) {
      contextRef.current = setupCanvasContext(canvasRef.current);
    }
  }, [dimensions]);

  // Rendering effect (consolidated from useCanvasRendering)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;

    if (!canvas || !ctx || dimensions.width === 0 || dimensions.height === 0) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects.forEach((obj) => replayDrawAction(obj, ctx, canvas!));
  }, [objects, dimensions]);

  // Canvas config effect
  useEffect(() => {
    if (canvasConfig) {
      setCanvasDimensions(canvasConfig.width, canvasConfig.height);
    }
  }, [canvasConfig, setCanvasDimensions]);

  return {
    // Refs (direct access, no object wrapping)
    canvasRef,
    containerRef,
    contextRef,

    // State
    dimensions,
    isDrawing,
    setIsDrawing,
    startPoint,
    currentPath,

    // Actions
    resetDrawingState,
    setCanvasDimensions,

    // Utils (direct functions, no object wrapping)
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
