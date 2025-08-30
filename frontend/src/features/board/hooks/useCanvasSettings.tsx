import React, { useState } from 'react';

import { CANVAS_CONFIG } from 'features/board/constants/BoardConstants';
import type { BoardDetails, UpdateCanvasSettingsRequest } from 'features/board/types/BoardTypes';
import { useTranslation } from 'react-i18next';

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
  canvasSize: keyof typeof CANVAS_CONFIG.CANVAS_SIZE_PRESETS | 'custom';
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
  
  // Utilities
  getTranslationKey: (sizeKey: string) => string;
}

export const useCanvasSettings = (
  { boardDetails, onUpdateSettings, styles }: UseCanvasSettingsOptions,
): UseCanvasSettingsReturn => {
  const { t } = useTranslation(['board', 'common']);

  // Translation key mapping utility
  const getTranslationKey = (sizeKey: string): string => {
    const keyMap: Record<string, string> = {
      'WIDESCREEN': 'widescreen',
      'SQUARE': 'square',
      'PORTRAIT': 'portrait',
      'DOCUMENT': 'document',
    };
    return keyMap[sizeKey] ?? sizeKey.toLowerCase();
  };

  // Detect current canvas size preset or custom
  const detectCurrentSizePreset = (): keyof typeof CANVAS_CONFIG.CANVAS_SIZE_PRESETS | 'custom' => {
    const presets = CANVAS_CONFIG.CANVAS_SIZE_PRESETS;
    for (const [key, preset] of Object.entries(presets)) {
      if (boardDetails.canvasWidth === preset.width && boardDetails.canvasHeight === preset.height) {
        return key as keyof typeof CANVAS_CONFIG.CANVAS_SIZE_PRESETS;
      }
    }
    return 'custom';
  };

  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(boardDetails.canvasBackgroundColor);
  const [canvasSize, setCanvasSize] = useState<keyof typeof CANVAS_CONFIG.CANVAS_SIZE_PRESETS | 'custom'>(
    detectCurrentSizePreset,
  );
  const [customWidth, setCustomWidth] = useState(boardDetails.canvasWidth);
  const [customHeight, setCustomHeight] = useState(boardDetails.canvasHeight);

  // Business logic functions
  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setBackgroundColor(boardDetails.canvasBackgroundColor);
    setCustomWidth(boardDetails.canvasWidth);
    setCustomHeight(boardDetails.canvasHeight);
    setCanvasSize(detectCurrentSizePreset());
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

  const handleCanvasSizeChange = (value: string) => {
    setCanvasSize(value as typeof canvasSize);
  };

  const handleCustomWidthChange = (value: string) => {
    const parsedValue = parseInt(value);
    setCustomWidth(Number.isNaN(parsedValue) ? boardDetails.canvasWidth : parsedValue);
  };

  const handleCustomHeightChange = (value: string) => {
    const parsedValue = parseInt(value);
    setCustomHeight(Number.isNaN(parsedValue) ? boardDetails.canvasHeight : parsedValue);
  };

  // Generate preset options for RadioGroup
  const generatePresetOptions = () => [
    ...CANVAS_CONFIG.PRESET_ORDER.map((size) => {
      const preset = CANVAS_CONFIG.CANVAS_SIZE_PRESETS[size];
      return {
        value: size,
        label: (
          <div className={styles?.presetLabel}>
            <span className={styles?.presetName}>
              {t(`board:canvasSize.presets.${getTranslationKey(size)}.label`)}
            </span>
            <span className={styles?.presetInfo}>
              ({preset.ratio}) - {preset.width}×{preset.height}
            </span>
          </div>
        ),
        ariaLabel: `${t(`board:canvasSize.presets.${getTranslationKey(size)}.label`)} (${preset.ratio}) - ${preset.width}×${preset.height}`,
      };
    }),
    {
      value: 'custom',
      label: (
        <div className={styles?.presetLabel}>
          <span className={styles?.presetName}>
            {t('board:canvasSize.custom.label')}
          </span>
          <span className={styles?.presetInfo} />
        </div>
      ),
      ariaLabel: t('board:canvasSize.custom.label'),
    },
  ];

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
    
    // Utilities
    getTranslationKey,
  };
};