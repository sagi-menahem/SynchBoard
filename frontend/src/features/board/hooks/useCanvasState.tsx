import { CANVAS_CONFIG } from 'features/board/constants/BoardConstants';
import type { BoardDetails } from 'features/board/types/BoardTypes';
import { useState } from 'react';

/**
 * Options interface for useCanvasState hook.
 * Defines the board data and preset detection function needed for state management.
 */
interface UseCanvasStateOptions {
  /** Current board details containing canvas configuration */
  boardDetails: BoardDetails;
  /** Function to detect current size preset from board dimensions */
  detectCurrentSizePreset: (
    boardDetails: BoardDetails,
  ) => keyof typeof CANVAS_CONFIG.CANVAS_SIZE_PRESETS | 'custom';
}

/**
 * Custom hook that manages canvas settings state and provides state manipulation functions.
 * This hook handles the local state for canvas settings including editing mode, background color,
 * size presets, custom dimensions, and provides utilities for resetting state and calculating
 * final dimensions based on current selections.
 * 
 * @param boardDetails - Current board details containing canvas configuration
 * @param detectCurrentSizePreset - Function to detect current size preset from board dimensions
 * @returns Object containing canvas settings state and manipulation functions
 */
export const useCanvasState = ({
  boardDetails,
  detectCurrentSizePreset,
}: UseCanvasStateOptions) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(boardDetails.canvasBackgroundColor);
  const [canvasSize, setCanvasSize] = useState<
    keyof typeof CANVAS_CONFIG.CANVAS_SIZE_PRESETS | 'custom'
  >(() => detectCurrentSizePreset(boardDetails));
  const [customWidth, setCustomWidth] = useState(boardDetails.canvasWidth);
  const [customHeight, setCustomHeight] = useState(boardDetails.canvasHeight);

  const resetState = () => {
    setBackgroundColor(boardDetails.canvasBackgroundColor);
    setCustomWidth(boardDetails.canvasWidth);
    setCustomHeight(boardDetails.canvasHeight);
    setCanvasSize(detectCurrentSizePreset(boardDetails));
    setIsEditing(false);
  };

  const calculateDimensions = () => {
    if (canvasSize === 'custom') {
      return {
        width: customWidth,
        height: customHeight,
      };
    } else {
      const preset = CANVAS_CONFIG.CANVAS_SIZE_PRESETS[canvasSize];
      return {
        width: preset.width,
        height: preset.height,
      };
    }
  };

  return {
    isEditing,
    isUpdating,
    backgroundColor,
    canvasSize,
    customWidth,
    customHeight,

    setIsEditing,
    setIsUpdating,
    setBackgroundColor,
    handleCanvasSizeChange: (value: string) =>
      setCanvasSize(value as keyof typeof CANVAS_CONFIG.CANVAS_SIZE_PRESETS | 'custom'),
    setCustomWidth,
    setCustomHeight,

    resetState,
    calculateDimensions,
  };
};
