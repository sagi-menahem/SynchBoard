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

/**
 * Custom hook that manages core canvas state, rendering context, and drawing utilities for collaborative whiteboard.
 * This hook provides the foundational canvas management functionality including canvas element references,
 * rendering context initialization, dimension management, and drawing state tracking. It handles the complex
 * coordination between canvas configuration, object rendering, and state synchronization while providing
 * access to essential drawing utilities and validation functions. The hook manages canvas lifecycle including
 * context setup, dimension updates, and object replay for maintaining visual consistency across collaborative
 * sessions and provides comprehensive drawing utilities for various shape and object types.
 * 
 * @param objects - Array of canvas objects to render and maintain on the canvas surface
 * @param canvasConfig - Optional configuration object containing canvas dimensions and background settings
 * @returns Object containing canvas references, drawing state, dimension management, utility functions, and drawing tools
 */
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

  // Initializes canvas rendering context when dimensions are available
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0 && canvasRef.current && !contextRef.current) {
      contextRef.current = setupCanvasContext(canvasRef.current);
    }
  }, [dimensions]);

  // Redraws all canvas objects whenever objects array or dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;

    if (!canvas || !ctx || dimensions.width === 0 || dimensions.height === 0) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects.forEach((obj) => replayDrawAction(obj, ctx, canvas!));
  }, [objects, dimensions]);

  // Updates canvas dimensions when configuration changes
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
