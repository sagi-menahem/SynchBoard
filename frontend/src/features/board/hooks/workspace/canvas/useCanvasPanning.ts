import { useCallback, useEffect, useRef, useState } from 'react';

interface ActivePointer {
  id: number;
  x: number;
  y: number;
}

interface UseCanvasPanningProps {
  containerRef: React.RefObject<HTMLElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

interface UseCanvasPanningReturn {
  isPanning: boolean;
  activePointerCount: number;
  handlePanStart: (event: React.PointerEvent<HTMLCanvasElement>) => boolean;
  handlePanMove: (event: PointerEvent) => void;
  handlePanEnd: (event: PointerEvent) => void;
}

/**
 * Custom hook for canvas panning functionality supporting both desktop and mobile interactions.
 *
 * Desktop panning:
 * - Middle Mouse Drag: Click and drag with middle mouse button to pan
 *
 * Mobile panning:
 * - Two-finger drag: Use two fingers to pan the canvas (single finger draws)
 *
 * @param containerRef - Reference to the scrollable container element
 * @param canvasRef - Reference to the canvas element for event coordination
 * @returns Panning state and handlers for integration with canvas events
 */
export const useCanvasPanning = ({
  containerRef,
}: UseCanvasPanningProps): UseCanvasPanningReturn => {
  const [isPanning, setIsPanning] = useState(false);

  // Track active pointers for multi-touch detection
  // Using ref to avoid re-renders on pointer changes
  const activePointers = useRef<Map<number, ActivePointer>>(new Map());
  const lastPanPosition = useRef<{ x: number; y: number } | null>(null);
  const lastCentroid = useRef<{ x: number; y: number } | null>(null);
  // Track which pointer initiated middle-mouse panning
  const middleMousePointerId = useRef<number | null>(null);

  /**
   * Clears all tracked pointers and resets panning state.
   * Called when panning ends or when state needs to be reset.
   */
  const clearAllPointers = useCallback(() => {
    activePointers.current.clear();
    lastPanPosition.current = null;
    lastCentroid.current = null;
    middleMousePointerId.current = null;
  }, []);

  /**
   * Calculate the centroid (center point) of all active pointers.
   * Used for two-finger panning to determine pan direction.
   */
  const calculateCentroid = useCallback((): { x: number; y: number } | null => {
    const pointers = Array.from(activePointers.current.values());
    if (pointers.length === 0) return null;

    const sum = pointers.reduce(
      (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
      { x: 0, y: 0 }
    );

    return {
      x: sum.x / pointers.length,
      y: sum.y / pointers.length,
    };
  }, []);

  /**
   * Handles pointer down events to determine if panning should start.
   * Returns true if panning was initiated (caller should skip drawing).
   */
  const handlePanStart = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>): boolean => {
      const pointerId = event.pointerId;
      const pointerData: ActivePointer = {
        id: pointerId,
        x: event.clientX,
        y: event.clientY,
      };

      activePointers.current.set(pointerId, pointerData);
      const pointerCount = activePointers.current.size;

      // Desktop: Middle mouse button (button === 1) always triggers panning
      if (event.button === 1) {
        event.preventDefault();
        setIsPanning(true);
        middleMousePointerId.current = pointerId;
        lastPanPosition.current = { x: event.clientX, y: event.clientY };
        return true;
      }

      // Mobile: Two fingers trigger panning
      if (pointerCount >= 2) {
        setIsPanning(true);
        lastCentroid.current = calculateCentroid();
        return true;
      }

      return false;
    },
    [calculateCentroid]
  );

  /**
   * Handles pointer move events during panning to scroll the container.
   */
  const handlePanMove = useCallback(
    (event: PointerEvent) => {
      const container = containerRef.current;
      if (!container || !isPanning) return;

      // Update tracked pointer position
      const existingPointer = activePointers.current.get(event.pointerId);
      if (existingPointer) {
        existingPointer.x = event.clientX;
        existingPointer.y = event.clientY;
      }

      const pointerCount = activePointers.current.size;

      // Multi-touch panning (mobile two-finger)
      if (pointerCount >= 2) {
        const newCentroid = calculateCentroid();
        if (newCentroid && lastCentroid.current) {
          const deltaX = lastCentroid.current.x - newCentroid.x;
          const deltaY = lastCentroid.current.y - newCentroid.y;

          container.scrollLeft += deltaX;
          container.scrollTop += deltaY;

          lastCentroid.current = newCentroid;
        }
        return;
      }

      // Middle mouse panning - only respond to the pointer that initiated panning
      if (middleMousePointerId.current !== null && event.pointerId === middleMousePointerId.current) {
        if (lastPanPosition.current) {
          const deltaX = lastPanPosition.current.x - event.clientX;
          const deltaY = lastPanPosition.current.y - event.clientY;

          container.scrollLeft += deltaX;
          container.scrollTop += deltaY;

          lastPanPosition.current = { x: event.clientX, y: event.clientY };
        }
      }
    },
    [containerRef, isPanning, calculateCentroid]
  );

  /**
   * Handles pointer up/cancel events to end panning when appropriate.
   * Clears all tracked pointers to prevent stale pointer issues on subsequent touches.
   */
  const handlePanEnd = useCallback(
    (event: PointerEvent) => {
      activePointers.current.delete(event.pointerId);
      const pointerCount = activePointers.current.size;

      // Check if middle mouse panning ended
      if (event.pointerId === middleMousePointerId.current) {
        middleMousePointerId.current = null;
        setIsPanning(false);
        lastPanPosition.current = null;
        return;
      }

      // End panning when no pointers left or only one remains
      // Clear ALL pointers when transitioning out of panning to prevent stale pointer issues
      // This is critical for mobile: after two-finger pan ends, we must not have any
      // stale pointers that would cause the next single-finger touch to be counted as 2 pointers
      if (pointerCount <= 1) {
        setIsPanning(false);
        clearAllPointers();
      }
    },
    [clearAllPointers]
  );

  // Clean up all pointers on unmount
  useEffect(() => {
    return () => {
      clearAllPointers();
    };
  }, [clearAllPointers]);

  return {
    isPanning,
    activePointerCount: activePointers.current.size,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
  };
};
