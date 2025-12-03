import type { PanInfo } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

import {
  DRAG_OPEN_THRESHOLD,
  MIN_DRAG_DISTANCE,
  TOOLBAR_HEIGHT_MOBILE,
  VELOCITY_THRESHOLD,
} from '../constants/RadialDockConstants';
import type { MobileDragHandlers } from '../types/RadialDockTypes';

interface UseMobileDragGestureProps {
  isMobile: boolean;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  setActiveSatellite: (satellite: string | null) => void;
  updateDockMinimized: (minimized: boolean) => Promise<void>;
}

interface UseMobileDragGestureResult {
  isDragging: boolean;
  dragY: number;
  toolbarHeight: number;
  dragHandlers: MobileDragHandlers;
}

/**
 * Hook that manages the mobile drag gesture for opening/closing the toolbar.
 * Handles drag state, calculates toolbar height during drag, and determines
 * when to trigger open/close based on distance and velocity.
 */
export const useMobileDragGesture = ({
  isMobile,
  isExpanded,
  setIsExpanded,
  setActiveSatellite,
  updateDockMinimized,
}: UseMobileDragGestureProps): UseMobileDragGestureResult => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);

  // Reset drag state when expanded changes
  useEffect(() => {
    if (isExpanded) {
      setDragY(0);
      setIsDragging(false);
    }
  }, [isExpanded]);

  // Update CSS custom property for toolbar height during drag (for FloatingActions sync)
  useEffect(() => {
    if (isMobile) {
      // Calculate current toolbar height
      let height = 0;
      if (isDragging) {
        if (isExpanded) {
          const closeProgress = Math.max(0, dragY) / TOOLBAR_HEIGHT_MOBILE;
          height = TOOLBAR_HEIGHT_MOBILE * (1 - closeProgress);
        } else {
          const openProgress = Math.abs(Math.min(0, dragY)) / TOOLBAR_HEIGHT_MOBILE;
          height = TOOLBAR_HEIGHT_MOBILE * openProgress;
        }
      } else {
        height = isExpanded ? TOOLBAR_HEIGHT_MOBILE : 0;
      }
      document.body.style.setProperty('--dock-toolbar-height', `${height}px`);
    }

    return () => {
      document.body.style.removeProperty('--dock-toolbar-height');
    };
  }, [isMobile, isDragging, dragY, isExpanded]);

  const handleDragStart = useCallback(() => {
    if (!isMobile) return;
    setIsDragging(true);
  }, [isMobile]);

  const handleDrag = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!isMobile) return;
      // info.offset.y is negative when dragging up, positive when dragging down
      // Clamp based on current state
      if (isExpanded) {
        // When open, only allow dragging down (positive values) to close
        const newDragY = Math.max(0, Math.min(TOOLBAR_HEIGHT_MOBILE, info.offset.y));
        setDragY(newDragY);
      } else {
        // When closed, only allow dragging up (negative values) to open
        const newDragY = Math.min(0, Math.max(-TOOLBAR_HEIGHT_MOBILE, info.offset.y));
        setDragY(newDragY);
      }
    },
    [isMobile, isExpanded],
  );

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!isMobile) return;
      setIsDragging(false);
      setDragY(0);

      const dragDistance = Math.abs(info.offset.y);
      const threshold = TOOLBAR_HEIGHT_MOBILE * DRAG_OPEN_THRESHOLD;

      if (isExpanded) {
        // Currently open - check if should close (drag down)
        if (
          info.offset.y > threshold ||
          (info.velocity.y > VELOCITY_THRESHOLD && dragDistance > MIN_DRAG_DISTANCE)
        ) {
          setIsExpanded(false);
          setActiveSatellite(null); // Close any open satellite when collapsing
          void updateDockMinimized(true);
        }
      } else {
        // Currently closed - check if should open (drag up)
        if (
          info.offset.y < -threshold ||
          (info.velocity.y < -VELOCITY_THRESHOLD && dragDistance > MIN_DRAG_DISTANCE)
        ) {
          setIsExpanded(true);
          void updateDockMinimized(false);
        }
      }
      // Otherwise framer-motion will snap back automatically due to dragConstraints
    },
    [isMobile, isExpanded, setIsExpanded, setActiveSatellite, updateDockMinimized],
  );

  // Calculate toolbar height to show based on drag progress
  const getToolbarHeight = useCallback(() => {
    if (isDragging) {
      if (isExpanded) {
        // Open, dragging down to close: reduce height
        const closeProgress = Math.max(0, dragY) / TOOLBAR_HEIGHT_MOBILE;
        return TOOLBAR_HEIGHT_MOBILE * (1 - closeProgress);
      } else {
        // Closed, dragging up to open: increase height
        const openProgress = Math.abs(Math.min(0, dragY)) / TOOLBAR_HEIGHT_MOBILE;
        return TOOLBAR_HEIGHT_MOBILE * openProgress;
      }
    }
    return isExpanded ? TOOLBAR_HEIGHT_MOBILE : 0;
  }, [isDragging, isExpanded, dragY]);

  return {
    isDragging,
    dragY,
    toolbarHeight: getToolbarHeight(),
    dragHandlers: {
      handleDragStart,
      handleDrag,
      handleDragEnd,
    },
  };
};
