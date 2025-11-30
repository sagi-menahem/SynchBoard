import type { Point } from 'features/board/types/BoardObjectTypes';
import { useConnectionStatus } from 'features/websocket/hooks/useConnectionStatus';
import { useCallback, useEffect, useRef } from 'react';

import { useCanvasPanning } from './useCanvasPanning';

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
  containerRef: React.RefObject<HTMLElement | null>;
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
 * Panning support:
 * - Desktop: Middle mouse button drag to pan
 * - Mobile: Two-finger drag to pan (single finger draws)
 *
 * @param canvasRef - Reference to the HTML canvas element for event attachment and coordinate calculations
 * @param containerRef - Reference to the scrollable container element for panning operations
 * @param contextRef - Reference to the 2D canvas rendering context for drawing operations validation
 * @param drawingState - Object containing drawing state management functions and current drawing status
 * @param getPointerCoordinates - Function for converting pointer events to canvas coordinate system
 * @param onPointerDown - Optional callback for handling pointer down events with structured event data
 * @param onPointerMove - Optional callback for handling pointer move events during drawing operations
 * @param onPointerUp - Optional callback for handling pointer up events to complete drawing operations
 * @returns Object containing the primary pointer down handler, drawing status, and panning state for canvas interactions
 */
export const useCanvasEvents = ({
  canvasRef,
  containerRef,
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

  // Initialize panning functionality
  const {
    isPanning,
    activePointerCount,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
  } = useCanvasPanning({ containerRef, canvasRef });

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const ctx = contextRef.current;

      if (!canvas || !ctx) {
        return;
      }

      // Check if this should initiate panning instead of drawing
      const shouldPan = handlePanStart(event);
      if (shouldPan) {
        // Cancel any ongoing drawing if panning starts (e.g., second finger added)
        if (isDrawing) {
          resetDrawingState();
        }
        return;
      }

      // Skip drawing if already drawing, panning, or multiple pointers are active
      // The activePointerCount check prevents phantom drawing when starting a 2-finger scroll
      if (isDrawing || isPanning || activePointerCount > 1) {
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
      isPanning,
      activePointerCount,
      setIsDrawing,
      startPoint,
      resetDrawingState,
      getPointerCoordinates,
      shouldBlockFunctionality,
      onPointerDown,
      handlePanStart,
    ],
  );

  // Manage global pointer event listeners during drawing and panning operations
  // Global listeners needed to track pointer outside canvas bounds
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const handleGlobalPointerMove = (event: PointerEvent) => {
      // Handle panning movement
      if (isPanning) {
        handlePanMove(event);
        return;
      }

      // Handle drawing movement
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

    const handleGlobalPointerUp = (event: PointerEvent) => {
      // ALWAYS notify panning system of pointer up to clean up tracked pointers
      // This is critical: even during drawing, we track pointers for multi-touch detection
      // If we don't clean them up, stale pointers cause bugs on subsequent touches
      handlePanEnd(event);

      // Handle drawing end
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

    // Listen when either drawing or panning is active
    if (isDrawing || isPanning) {
      window.addEventListener('pointermove', handleGlobalPointerMove);
      window.addEventListener('pointerup', handleGlobalPointerUp);
      window.addEventListener('pointercancel', handleGlobalPointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [
    isDrawing,
    isPanning,
    canvasRef,
    getPointerCoordinates,
    startPoint,
    setIsDrawing,
    onPointerMove,
    onPointerUp,
    handlePanMove,
    handlePanEnd,
  ]);

  return {
    handlePointerDown,
    isDrawing,
    isPanning,
  };
};
