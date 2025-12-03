import { useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_WINDOW_WIDTH,
  FLOATING_ACTIONS_WIDTH,
  MIN_CANVAS_WIDTH_FOR_HORIZONTAL,
  RIGHT_MARGIN,
  TOOLBAR_WIDTH,
} from '../constants/RadialDockConstants';

interface UseToolbarPositionProps {
  isMobile: boolean;
  isChatOpen: boolean;
  canvasSplitRatio: number;
  isRTLMode: boolean;
}

interface UseToolbarPositionResult {
  windowWidth: number;
  canvasWidthPx: number;
  useVerticalLayout: boolean;
  toolbarStyle: React.CSSProperties;
}

/**
 * Hook that calculates the toolbar position based on canvas size and layout.
 * Handles both horizontal and vertical layouts, RTL mode, and responsive positioning.
 */
export const useToolbarPosition = ({
  isMobile,
  isChatOpen,
  canvasSplitRatio,
  isRTLMode,
}: UseToolbarPositionProps): UseToolbarPositionResult => {
  // Track window width for responsive layout calculations
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : DEFAULT_WINDOW_WIDTH,
  );

  // Listen to window resize events
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate canvas width in pixels
  const canvasWidthPx = useMemo(() => {
    const canvasWidthPercent = isChatOpen ? canvasSplitRatio : 100;
    return (windowWidth * canvasWidthPercent) / 100;
  }, [isChatOpen, canvasSplitRatio, windowWidth]);

  // Calculate if we should use vertical layout based on available canvas width
  const useVerticalLayout = useMemo(() => {
    if (isMobile) return false;
    return canvasWidthPx < MIN_CANVAS_WIDTH_FOR_HORIZONTAL;
  }, [isMobile, canvasWidthPx]);

  // Calculate the position of the toolbar on desktop
  // In RTL mode, the canvas panel is visually on the RIGHT side of the window
  // Canvas starts at (windowWidth - canvasWidthPx) from the left edge
  const toolbarStyle = useMemo((): React.CSSProperties => {
    if (isMobile) return {};

    // Calculate where the canvas panel starts from the left edge of the window
    // LTR: Canvas is at left edge (starts at 0)
    // RTL: Canvas is at right edge (starts at windowWidth - canvasWidthPx)
    const canvasStartPx = isRTLMode ? windowWidth - canvasWidthPx : 0;

    // Distance from window right edge to canvas right edge (chat panel width)
    // LTR: chatPanelWidth = windowWidth - canvasWidthPx (chat is on right)
    // RTL: chatPanelWidth = 0 when calculating from canvas perspective (chat is on left, before canvas)
    const chatPanelWidth = isRTLMode ? 0 : windowWidth - canvasWidthPx;

    if (useVerticalLayout) {
      // Vertical layout: position near the chat panel side
      // LTR: Chat is on right, so toolbar on right side of canvas (use right positioning)
      // RTL: Chat is on left, so toolbar on left side of canvas (use left positioning)
      if (isRTLMode) {
        // RTL: Position from left edge, near chat panel
        return {
          left: `${canvasStartPx + RIGHT_MARGIN}px`,
          right: 'auto',
          bottom: '32px',
          top: 'auto',
          transform: 'none',
        };
      }
      // LTR: Position from right edge, near chat panel
      return {
        right: `${chatPanelWidth + RIGHT_MARGIN}px`,
        left: 'auto',
        bottom: '32px',
        top: 'auto',
        transform: 'none',
      };
    }

    // Horizontal layout positioning:
    // Goal: Center toolbar in canvas, but shift away from floating buttons,
    // and ensure it never extends into the chat panel area.

    // Calculate the center of the canvas in window coordinates
    const canvasCenterPx = canvasStartPx + canvasWidthPx / 2;
    const toolbarHalfWidth = TOOLBAR_WIDTH / 2;

    // Calculate where toolbar edges would be if centered (in window coordinates)
    const toolbarLeftIfCentered = canvasCenterPx - toolbarHalfWidth;
    const toolbarRightIfCentered = canvasCenterPx + toolbarHalfWidth;

    // Available space for toolbar in window coordinates
    // LTR: FloatingActions on left (from 0), chat on right
    // RTL: Chat on left (from 0), FloatingActions on right (at canvasStart + canvasWidth - offset)
    const availableLeft = isRTLMode
      ? canvasStartPx + RIGHT_MARGIN // Small margin from chat panel edge
      : FLOATING_ACTIONS_WIDTH; // After floating actions
    const availableRight = isRTLMode
      ? canvasStartPx + canvasWidthPx - FLOATING_ACTIONS_WIDTH // Before floating actions
      : canvasStartPx + canvasWidthPx - RIGHT_MARGIN; // Small margin from chat panel
    const availableWidth = availableRight - availableLeft;

    // If centered position doesn't fit in available space, calculate best position
    if (toolbarLeftIfCentered < availableLeft || toolbarRightIfCentered > availableRight) {
      // Calculate the optimal position: center within available space
      const availableCenterPx = availableLeft + availableWidth / 2;

      // If toolbar fits in available space, center it there
      if (TOOLBAR_WIDTH <= availableWidth) {
        return {
          left: `${availableCenterPx}px`,
          right: 'auto',
          bottom: '32px',
          top: 'auto',
          transform: 'translateX(-50%)',
        };
      }

      // Toolbar doesn't fit well - position from right edge to ensure no cutoff by chat
      return {
        right: `${chatPanelWidth + RIGHT_MARGIN}px`,
        left: 'auto',
        bottom: '32px',
        top: 'auto',
        transform: 'none',
      };
    }

    // Centered position works perfectly
    return {
      left: `${canvasCenterPx}px`,
      right: 'auto',
      bottom: '32px',
      top: 'auto',
      transform: 'translateX(-50%)',
    };
  }, [isMobile, useVerticalLayout, canvasWidthPx, windowWidth, isRTLMode]);

  return {
    windowWidth,
    canvasWidthPx,
    useVerticalLayout,
    toolbarStyle,
  };
};
