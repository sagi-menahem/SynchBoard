import { useCallback, useEffect, useRef, useState } from 'react';

interface ActivePointer {
  id: number;
  x: number;
  y: number;
}

interface UseCanvasPanningProps {
  containerRef: React.RefObject<HTMLElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Current zoom scale for pinch-to-zoom calculations */
  zoomScale?: number;
  /** Callback when zoom changes via pinch gesture */
  onZoomChange?: (newScale: number, centerPoint: { x: number; y: number }) => void;
  /** Minimum zoom scale (default 0.1) */
  minZoom?: number;
  /** Maximum zoom scale (default 5.0) */
  maxZoom?: number;
}

interface UseCanvasPanningReturn {
  isPanning: boolean;
  activePointerCount: number;
  handlePanStart: (event: React.PointerEvent<HTMLCanvasElement>) => boolean;
  handlePanMove: (event: PointerEvent) => void;
  handlePanEnd: (event: PointerEvent) => void;
}

/**
 * Custom hook for canvas panning and pinch-to-zoom functionality supporting both desktop and mobile interactions.
 *
 * Desktop panning:
 * - Middle Mouse Drag: Click and drag with middle mouse button to pan
 *
 * Mobile panning:
 * - Two-finger drag: Use two fingers to pan the canvas (single finger draws)
 *
 * Pinch-to-zoom (mobile):
 * - Two-finger pinch: Spread fingers apart to zoom in, pinch together to zoom out
 * - Zoom is centered on the midpoint between the two fingers
 *
 * @param containerRef - Reference to the scrollable container element
 * @param canvasRef - Reference to the canvas element for event coordination
 * @param zoomScale - Current zoom scale for pinch calculations
 * @param onZoomChange - Callback when zoom changes via pinch gesture
 * @param minZoom - Minimum zoom scale (default 0.1)
 * @param maxZoom - Maximum zoom scale (default 5.0)
 * @returns Panning state and handlers for integration with canvas events
 */
export const useCanvasPanning = ({
  containerRef,
  zoomScale = 1.0,
  onZoomChange,
  minZoom = 0.1,
  maxZoom = 5.0,
}: UseCanvasPanningProps): UseCanvasPanningReturn => {
  const [isPanning, setIsPanning] = useState(false);

  // Track active pointers for multi-touch detection
  // Using ref to avoid re-renders on pointer changes
  const activePointers = useRef<Map<number, ActivePointer>>(new Map());
  const lastPanPosition = useRef<{ x: number; y: number } | null>(null);
  const lastCentroid = useRef<{ x: number; y: number } | null>(null);
  // Track which pointer initiated middle-mouse panning
  const middleMousePointerId = useRef<number | null>(null);
  // Track if we have any active pointers that need cleanup
  const hasActivePointers = useRef(false);
  // Track last distance between two fingers for pinch-to-zoom
  const lastPinchDistance = useRef<number | null>(null);
  // Store current zoom scale in ref for use in callbacks
  const currentZoomRef = useRef(zoomScale);
  currentZoomRef.current = zoomScale;

  /**
   * Clears all tracked pointers and resets panning/zoom state.
   * Called when panning ends or when state needs to be reset.
   */
  const clearAllPointers = useCallback(() => {
    activePointers.current.clear();
    lastPanPosition.current = null;
    lastCentroid.current = null;
    middleMousePointerId.current = null;
    hasActivePointers.current = false;
    lastPinchDistance.current = null;
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
   * Calculate the distance between two pointers for pinch-to-zoom.
   * Returns null if there aren't exactly 2 pointers.
   */
  const calculatePinchDistance = useCallback((): number | null => {
    const pointers = Array.from(activePointers.current.values());
    if (pointers.length !== 2) return null;

    const [p1, p2] = pointers;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
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
      hasActivePointers.current = true;
      const pointerCount = activePointers.current.size;

      // Desktop: Middle mouse button (button === 1) always triggers panning
      if (event.button === 1) {
        event.preventDefault();
        setIsPanning(true);
        middleMousePointerId.current = pointerId;
        lastPanPosition.current = { x: event.clientX, y: event.clientY };
        return true;
      }

      // Mobile: Two fingers trigger panning and pinch-to-zoom
      if (pointerCount >= 2) {
        setIsPanning(true);
        lastCentroid.current = calculateCentroid();
        // Initialize pinch distance for zoom detection
        lastPinchDistance.current = calculatePinchDistance();
        return true;
      }

      return false;
    },
    [calculateCentroid, calculatePinchDistance]
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

      // Multi-touch panning and pinch-to-zoom (mobile two-finger)
      if (pointerCount >= 2) {
        const newCentroid = calculateCentroid();

        // Handle pinch-to-zoom
        if (onZoomChange) {
          const newDistance = calculatePinchDistance();
          if (newDistance !== null && lastPinchDistance.current !== null) {
            const distanceDelta = newDistance - lastPinchDistance.current;
            // Scale sensitivity: larger movements = more zoom change
            const zoomSensitivity = 0.005;
            const zoomDelta = distanceDelta * zoomSensitivity;

            const newScale = Math.min(maxZoom, Math.max(minZoom, currentZoomRef.current + zoomDelta));

            // Only trigger zoom change if scale actually changed
            if (newScale !== currentZoomRef.current && newCentroid) {
              onZoomChange(newScale, newCentroid);
            }
          }
          lastPinchDistance.current = newDistance;
        }

        // Handle panning
        if (newCentroid && lastCentroid.current) {
          const deltaX = lastCentroid.current.x - newCentroid.x;
          const deltaY = lastCentroid.current.y - newCentroid.y;

          container.scrollLeft += deltaX;
          container.scrollTop += deltaY;
        }
        lastCentroid.current = newCentroid;
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
    [containerRef, isPanning, calculateCentroid, calculatePinchDistance, onZoomChange, minZoom, maxZoom]
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

  // Always listen for pointer up/cancel on container to clean up stale pointers
  // This is critical: when a touch starts outside the canvas and doesn't trigger
  // drawing or panning, the global listeners in useCanvasEvents won't be active.
  // Without this, the pointer would remain in activePointers and cause the next
  // touch to be counted as 2 pointers, incorrectly triggering panning.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleContainerPointerUp = (event: PointerEvent) => {
      // Only process if we have active pointers to clean up
      if (!hasActivePointers.current) return;

      activePointers.current.delete(event.pointerId);

      // Check if middle mouse panning ended
      if (event.pointerId === middleMousePointerId.current) {
        middleMousePointerId.current = null;
        setIsPanning(false);
        lastPanPosition.current = null;
      }

      // If no more pointers, clean up everything
      if (activePointers.current.size === 0) {
        clearAllPointers();
      }
    };

    container.addEventListener('pointerup', handleContainerPointerUp);
    container.addEventListener('pointercancel', handleContainerPointerUp);
    // Also listen on window for pointers that end outside the container
    window.addEventListener('pointerup', handleContainerPointerUp);
    window.addEventListener('pointercancel', handleContainerPointerUp);

    return () => {
      container.removeEventListener('pointerup', handleContainerPointerUp);
      container.removeEventListener('pointercancel', handleContainerPointerUp);
      window.removeEventListener('pointerup', handleContainerPointerUp);
      window.removeEventListener('pointercancel', handleContainerPointerUp);
    };
  }, [containerRef, clearAllPointers]);

  return {
    isPanning,
    activePointerCount: activePointers.current.size,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
  };
};
