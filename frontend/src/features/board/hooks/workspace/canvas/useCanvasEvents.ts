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
  getPointerCoordinates: (event: PointerEvent, canvas: HTMLCanvasElement) => Point | null;
  onPointerDown?: (eventData: CanvasEventData) => void;
  onPointerMove?: (eventData: CanvasEventData) => void;
  onPointerUp?: (eventData: CanvasEventData) => void;
}

/**
 * Custom hook that manages comprehensive canvas pointer event handling for collaborative drawing interactions.
 * This hook provides sophisticated event processing for canvas interactions including pointer down, move, and up events
 * with proper state management, coordinate tracking, and connection status awareness. It handles the complex
 * coordination between local drawing state and global canvas events, manages event propagation with proper cleanup,
 * and integrates connection status checking to prevent interactions during disconnected states. The hook abstracts
 * the complexity of canvas event handling while providing structured event data to downstream handlers and maintaining
 * proper drawing state consistency throughout interaction sessions. Supports mouse, touch, and stylus input
 * through the Pointer Events API.
 *
 * @param canvasRef - Reference to the HTML canvas element for event attachment and coordinate calculations
 * @param contextRef - Reference to the 2D canvas rendering context for drawing operations validation
 * @param drawingState - Object containing drawing state management functions and current drawing status
 * @param getPointerCoordinates - Function for converting pointer events to canvas coordinate system
 * @param onPointerDown - Optional callback for handling pointer down events with structured event data
 * @param onPointerMove - Optional callback for handling pointer move events during drawing operations
 * @param onPointerUp - Optional callback for handling pointer up events to complete drawing operations
 * @returns Object containing the primary pointer down handler and current drawing status for canvas interactions
 */
export const useCanvasEvents = ({
  canvasRef,
  contextRef,
  drawingState,
  getPointerCoordinates,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: UseCanvasEventsProps) => {
  const { isDrawing, setIsDrawing, startPoint, resetDrawingState } = drawingState;
  const { shouldBlockFunctionality } = useConnectionStatus();
  const lastPointerPosition = useRef<Point | null>(null);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const ctx = contextRef.current;

      if (!canvas || !ctx || isDrawing) {
        return;
      }

      if (shouldBlockFunctionality) {
        return;
      }

      const coords = getPointerCoordinates(event.nativeEvent, canvas);
      if (!coords) {
        return;
      }

      resetDrawingState();
      setIsDrawing(true);
      startPoint.current = coords;
      lastPointerPosition.current = coords;

      const eventData: CanvasEventData = {
        startPoint: coords,
        currentPoint: coords,
        isFirstMove: true,
      };

      onPointerDown?.(eventData);
    },
    [
      canvasRef,
      contextRef,
      isDrawing,
      setIsDrawing,
      startPoint,
      resetDrawingState,
      getPointerCoordinates,
      shouldBlockFunctionality,
      onPointerDown,
    ],
  );

  // Manage global pointer event listeners during drawing operations - global listeners needed to track pointer outside canvas bounds
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDrawing || !startPoint.current) {
        return;
      }

      const coords = getPointerCoordinates(event, canvas);
      if (!coords) {
        return;
      }

      const isFirstMove =
        !lastPointerPosition.current ||
        (lastPointerPosition.current.x === startPoint.current.x &&
          lastPointerPosition.current.y === startPoint.current.y);

      const eventData: CanvasEventData = {
        startPoint: startPoint.current,
        currentPoint: coords,
        isFirstMove,
      };

      lastPointerPosition.current = coords;
      onPointerMove?.(eventData);
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!isDrawing || !startPoint.current) {
        return;
      }

      const coords = getPointerCoordinates(event, canvas);
      if (!coords) {
        return;
      }

      const eventData: CanvasEventData = {
        startPoint: startPoint.current,
        currentPoint: coords,
        isFirstMove: false,
      };

      setIsDrawing(false);
      onPointerUp?.(eventData);

      startPoint.current = null;
      lastPointerPosition.current = null;
    };

    if (isDrawing) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDrawing, canvasRef, getPointerCoordinates, startPoint, setIsDrawing, onPointerMove, onPointerUp]);

  return {
    handlePointerDown,
    isDrawing,
  };
};
