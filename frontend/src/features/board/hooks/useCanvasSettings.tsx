import type { BoardDetails, UpdateCanvasSettingsRequest } from 'features/board/types/BoardTypes';

import { useCanvasPresets } from './useCanvasPresets';
import { useCanvasState } from './useCanvasState';

/**
 * Options interface for useCanvasSettings hook.
 * Defines the board data, update handlers, and styling options for canvas settings management.
 */
interface UseCanvasSettingsOptions {
  /** Current board details including canvas configuration */
  boardDetails: BoardDetails;
  /** Handler for applying canvas settings updates */
  onUpdateSettings: (settings: UpdateCanvasSettingsRequest) => Promise<void>;
  /** CSS class names for styling preset display components */
  styles?: {
    /** Style class for the preset label container */
    presetLabel?: string;
    /** Style class for the preset name text */
    presetName?: string;
    /** Style class for the preset info text (dimensions and ratio) */
    presetInfo?: string;
  };
}

/**
 * Return type interface for useCanvasSettings hook.
 * Defines the state values and handlers returned for managing canvas settings UI.
 */
interface UseCanvasSettingsReturn {
  /** Whether the settings are currently in edit mode */
  isEditing: boolean;
  /** Whether a settings update operation is in progress */
  isUpdating: boolean;
  /** Current canvas background color value */
  backgroundColor: string;
  /** Current selected canvas size preset or 'custom' */
  canvasSize: string;
  /** Custom width value for canvas when using custom size */
  customWidth: number;
  /** Custom height value for canvas when using custom size */
  customHeight: number;

  /** Handler to enter edit mode for canvas settings */
  handleStartEditing: () => void;
  /** Handler to cancel editing and reset changes */
  handleCancel: () => void;
  /** Handler to save current settings changes */
  handleSave: () => Promise<void>;
  /** Handler for background color changes */
  setBackgroundColor: (color: string) => void;
  /** Handler for canvas size preset selection changes */
  handleCanvasSizeChange: (value: string) => void;
  /** Handler for custom width input changes */
  handleCustomWidthChange: (value: string) => void;
  /** Handler for custom height input changes */
  handleCustomHeightChange: (value: string) => void;

  /** Array of preset options for canvas size selection UI */
  presetOptions: {
    /** Preset identifier value */
    value: string;
    /** React element for displaying preset label */
    label: React.ReactElement;
    /** Accessible aria label for screen readers */
    ariaLabel: string;
  }[];
}

/**
 * Custom hook that manages canvas settings state and operations for board configuration.
 * This hook orchestrates canvas settings management by combining preset functionality with
 * state management to provide a complete interface for editing canvas properties including
 * background color, dimensions, and preset selections.
 * 
 * @param boardDetails - Current board details including canvas configuration
 * @param onUpdateSettings - Handler for applying canvas settings updates
 * @param styles - CSS class names for styling preset display components
 * @returns Complete canvas settings management interface with state and handlers
 */
export const useCanvasSettings = ({
  boardDetails,
  onUpdateSettings,
  styles,
}: UseCanvasSettingsOptions): UseCanvasSettingsReturn => {
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
    isEditing,
    isUpdating,
    backgroundColor,
    canvasSize,
    customWidth,
    customHeight,

    handleStartEditing,
    handleCancel,
    handleSave,
    setBackgroundColor,
    handleCanvasSizeChange,
    handleCustomWidthChange,
    handleCustomHeightChange,

    presetOptions: generatePresetOptions(),
  };
};
