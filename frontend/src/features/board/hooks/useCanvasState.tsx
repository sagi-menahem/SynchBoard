import { CANVAS_CONFIG } from 'features/board/constants/BoardConstants';
import type { BoardDetails } from 'features/board/types/BoardTypes';
import { useState } from 'react';

interface UseCanvasStateOptions {
  boardDetails: BoardDetails;
  detectCurrentSizePreset: (
    boardDetails: BoardDetails,
  ) => keyof typeof CANVAS_CONFIG.CANVAS_SIZE_PRESETS | 'custom';
}

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
