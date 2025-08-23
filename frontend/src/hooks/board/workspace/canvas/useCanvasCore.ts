import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import type { Point } from 'types/BoardObjectTypes';
import {
  drawCirclePayload,
  drawLinePayload,
  drawRectanglePayload,
  getMouseCoordinates,
  isRadiusValid,
  isShapeSizeValid,
  replayDrawAction,
  setupCanvasContext,
} from 'utils';

export interface DrawingState {
    isDrawing: boolean;
    setIsDrawing: (drawing: boolean) => void;
    startPoint: React.RefObject<Point | null>;
    currentPath: React.RefObject<Point[]>;
    resetDrawingState: () => void;
}

interface CanvasRefs {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
    contextRef: React.RefObject<CanvasRenderingContext2D | null>;
}

export const useCanvasCore = () => {
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

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [containerRef]);


  const refs: CanvasRefs = {
    canvasRef,
    containerRef,
    contextRef,
  };

  const drawingState: DrawingState = {
    isDrawing,
    setIsDrawing,
    startPoint,
    currentPath,
    resetDrawingState,
  };

  const utils = {
    replayDrawAction,
    drawLinePayload,
    drawRectanglePayload,
    drawCirclePayload,
    setupCanvasContext,
    getMouseCoordinates,
    isShapeSizeValid,
    isRadiusValid,
  };

  return {
    dimensions,
    refs,
    drawingState,
    utils,
  };
};