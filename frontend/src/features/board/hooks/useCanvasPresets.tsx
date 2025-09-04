import { CANVAS_CONFIG } from 'features/board/constants/BoardConstants';
import type { BoardDetails } from 'features/board/types/BoardTypes';
import { useTranslation } from 'react-i18next';

interface UseCanvasPresetsOptions {
  styles?: {
    presetLabel?: string;
    presetName?: string;
    presetInfo?: string;
  };
}

// Translation key mapping utility
const getTranslationKey = (sizeKey: string): string => {
  const keyMap: Record<string, string> = {
    WIDESCREEN: 'widescreen',
    SQUARE: 'square',
    PORTRAIT: 'portrait',
    DOCUMENT: 'document',
  };
  return keyMap[sizeKey] ?? sizeKey.toLowerCase();
};

export const useCanvasPresets = ({ styles }: UseCanvasPresetsOptions = {}) => {
  const { t } = useTranslation(['board']);

  // Detect current canvas size preset or custom
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
