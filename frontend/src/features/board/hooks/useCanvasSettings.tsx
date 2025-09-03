import type { BoardDetails, UpdateCanvasSettingsRequest } from 'features/board/types/BoardTypes';

import { useCanvasPresets } from './useCanvasPresets';
import { useCanvasState } from './useCanvasState';

interface UseCanvasSettingsOptions {
  boardDetails: BoardDetails;
  onUpdateSettings: (settings: UpdateCanvasSettingsRequest) => Promise<void>;
  styles?: {
    presetLabel?: string;
    presetName?: string;
    presetInfo?: string;
  };
}

interface UseCanvasSettingsReturn {
  // State
  isEditing: boolean;
  isUpdating: boolean;
  backgroundColor: string;
  canvasSize: string;
  customWidth: number;
  customHeight: number;
  
  // Actions
  handleStartEditing: () => void;
  handleCancel: () => void;
  handleSave: () => Promise<void>;
  setBackgroundColor: (color: string) => void;
  handleCanvasSizeChange: (value: string) => void;
  handleCustomWidthChange: (value: string) => void;
  handleCustomHeightChange: (value: string) => void;
  
  // Computed values
  presetOptions: {
    value: string;
    label: React.ReactElement;
    ariaLabel: string;
  }[];
}

export const useCanvasSettings = (
  { boardDetails, onUpdateSettings, styles }: UseCanvasSettingsOptions,
): UseCanvasSettingsReturn => {
  const { detectCurrentSizePreset, generatePresetOptions } = useCanvasPresets({ styles });
  const {
    isEditing,
    isUpdating,
    backgroundColor,
    canvasSize,
    customWidth,
    customHeight,
    setIsEditing,
    setIsUpdating,
    setBackgroundColor,
    handleCanvasSizeChange,
    setCustomWidth,
    setCustomHeight,
    resetState,
    calculateDimensions,
  } = useCanvasState({ boardDetails, detectCurrentSizePreset });

  // Business logic functions
  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    resetState();
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const { width, height } = calculateDimensions();

      await onUpdateSettings({
        canvasBackgroundColor: backgroundColor,
        canvasWidth: width,
        canvasHeight: height,
      });

      setIsEditing(false);
    } finally {
      setIsUpdating(false);
    }
  };


  const handleCustomWidthChange = (value: string) => {
    const parsedValue = parseInt(value);
    setCustomWidth(Number.isNaN(parsedValue) ? boardDetails.canvasWidth : parsedValue);
  };

  const handleCustomHeightChange = (value: string) => {
    const parsedValue = parseInt(value);
    setCustomHeight(Number.isNaN(parsedValue) ? boardDetails.canvasHeight : parsedValue);
  };


  return {
    // State
    isEditing,
    isUpdating,
    backgroundColor,
    canvasSize,
    customWidth,
    customHeight,
    
    // Actions
    handleStartEditing,
    handleCancel,
    handleSave,
    setBackgroundColor,
    handleCanvasSizeChange,
    handleCustomWidthChange,
    handleCustomHeightChange,
    
    // Computed values
    presetOptions: generatePresetOptions(),
  };
};