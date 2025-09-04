import { CANVAS_CONFIG } from 'features/board/constants/BoardConstants';
import type { BoardDetails } from 'features/board/types/BoardTypes';
import { useTranslation } from 'react-i18next';

/**
 * Options interface for useCanvasPresets hook.
 * Defines CSS class styles for rendering preset options with proper styling.
 */
interface UseCanvasPresetsOptions {
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
 * Utility function to map canvas size preset keys to translation keys.
 * Converts internal constant keys to lowercase translation keys for i18n.
 */
const getTranslationKey = (sizeKey: string): string => {
  const keyMap: Record<string, string> = {
    WIDESCREEN: 'widescreen',
    SQUARE: 'square',
    PORTRAIT: 'portrait',
    DOCUMENT: 'document',
  };
  return keyMap[sizeKey] ?? sizeKey.toLowerCase();
};

/**
 * Custom hook that manages canvas size presets and preset detection functionality.
 * This hook provides utilities for working with predefined canvas sizes, detecting current
 * preset from board dimensions, generating preset options for UI components, and handling
 * internationalization for preset labels.
 * 
 * @param styles - CSS class names for styling preset display components
 * @returns Object containing preset detection, option generation, and utility functions
 */
export const useCanvasPresets = ({ styles }: UseCanvasPresetsOptions = {}) => {
  const { t } = useTranslation(['board']);

  const detectCurrentSizePreset = (
    boardDetails: BoardDetails,
  ): keyof typeof CANVAS_CONFIG.CANVAS_SIZE_PRESETS | 'custom' => {
    const presets = CANVAS_CONFIG.CANVAS_SIZE_PRESETS;
    for (const [key, preset] of Object.entries(presets)) {
      if (
        boardDetails.canvasWidth === preset.width &&
        boardDetails.canvasHeight === preset.height
      ) {
        return key as keyof typeof CANVAS_CONFIG.CANVAS_SIZE_PRESETS;
      }
    }
    return 'custom';
  };

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
          <span className={styles?.presetName}>{t('board:canvasSize.custom.label')}</span>
          <span className={styles?.presetInfo} />
        </div>
      ),
      ariaLabel: t('board:canvasSize.custom.label'),
    },
  ];

  return {
    detectCurrentSizePreset,
    generatePresetOptions,
    getTranslationKey,
  };
};
