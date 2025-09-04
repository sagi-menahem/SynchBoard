import type { Point } from 'features/board/types/BoardObjectTypes';
import { useConnectionStatus } from 'features/websocket/hooks/useConnectionStatus';
import { useCallback, useEffect, useRef } from 'react';

export interface CanvasEventData {
  startPoint: Point;
  currentPoint: Point;
  isFirstMove: boolean;
}

export interface CanvasEventsState {
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  startPoint: React.RefObject<Point | null>;
  resetDrawingState: () => void;
}

interface UseCanvasEventsProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  contextRef: React.RefObject<CanvasRenderingContext2D | null>;
  drawingState: CanvasEventsState;
  getMouseCoordinates: (event: MouseEvent, canvas: HTMLCanvasElement) => Point | null;
  onMouseDown?: (eventData: CanvasEventData) => void;
  onMouseMove?: (eventData: CanvasEventData) => void;
  onMouseUp?: (eventData: CanvasEventData) => void;
}

export const useCanvasEvents = ({
  canvasRef,
  contextRef,
  drawingState,
  getMouseCoordinates,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: UseCanvasEventsProps) => {
  const { isDrawing, setIsDrawing, startPoint, resetDrawingState } = drawingState;
  const { shouldBlockFunctionality } = useConnectionStatus();
  const lastMousePosition = useRef<Point | null>(null);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const ctx = contextRef.current;

      if (!canvas || !ctx || isDrawing) {
        return;
      }

      if (shouldBlockFunctionality) {
        return;
      }

      const coords = getMouseCoordinates(event.nativeEvent, canvas);
      if (!coords) {
        return;
      }

      resetDrawingState();
      setIsDrawing(true);
      startPoint.current = coords;
      lastMousePosition.current = coords;

      const eventData: CanvasEventData = {
        startPoint: coords,
        currentPoint: coords,
        isFirstMove: true,
      };

      onMouseDown?.(eventData);
    },
    [
      canvasRef,
      contextRef,
      isDrawing,
      setIsDrawing,
      startPoint,
      resetDrawingState,
      getMouseCoordinates,
      shouldBlockFunctionality,
      onMouseDown,
    ],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDrawing || !startPoint.current) {
        return;
      }

      const coords = getMouseCoordinates(event, canvas);
      if (!coords) {
        return;
      }

      const isFirstMove =
        !lastMousePosition.current ||
        (lastMousePosition.current.x === startPoint.current.x &&
          lastMousePosition.current.y === startPoint.current.y);

      const eventData: CanvasEventData = {
        startPoint: startPoint.current,
        currentPoint: coords,
        isFirstMove,
      };

      lastMousePosition.current = coords;
      onMouseMove?.(eventData);
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (!isDrawing || !startPoint.current) {
        return;
      }

      const coords = getMouseCoordinates(event, canvas);
      if (!coords) {
        return;
      }

      const eventData: CanvasEventData = {
        startPoint: startPoint.current,
        currentPoint: coords,
        isFirstMove: false,
      };

      setIsDrawing(false);
      onMouseUp?.(eventData);

      // Clean up
      startPoint.current = null;
      lastMousePosition.current = null;
    };

    if (isDrawing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDrawing, canvasRef, getMouseCoordinates, startPoint, setIsDrawing, onMouseMove, onMouseUp]);

  return {
    handleMouseDown,
    isDrawing,
  };
};
