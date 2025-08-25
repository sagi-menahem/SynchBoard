import { useCallback, useRef, useState } from 'react';

import {
  drawCirclePayload,
  drawLinePayload,
  drawRectanglePayload,
  drawTrianglePayload,
  drawPolygonPayload,
  drawTextPayload,
  drawFillPayload,
  getMouseCoordinates,
  isRadiusValid,
  isShapeSizeValid,
  replayDrawAction,
  setupCanvasContext,
} from 'utils';

import type { Point } from 'types/BoardObjectTypes';

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

  // For fixed-size canvas, we set dimensions based on canvas config
  const setCanvasDimensions = useCallback((width: number, height: number) => {
    setDimensions({ width, height });
  }, []);


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
    drawTrianglePayload,
    drawPolygonPayload,
    drawTextPayload,
    drawFillPayload,
    setupCanvasContext,
    getMouseCoordinates,
    isShapeSizeValid,
    isRadiusValid,
    setCanvasDimensions,
  };

  return {
    dimensions,
    refs,
    drawingState,
    utils,
  };
};