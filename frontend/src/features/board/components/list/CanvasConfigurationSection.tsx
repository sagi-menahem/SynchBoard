import React from 'react';

import { CANVAS_CONFIG } from 'features/board/constants/BoardConstants';
import { Monitor } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ColorPicker, Input, RadioGroup, SectionCard } from 'shared/ui';
import styles from 'shared/ui/styles/CommonForm.module.scss';
import utilStyles from 'shared/ui/styles/utils.module.scss';
import { getColorName } from 'shared/utils/ColorUtils';

interface CanvasConfigurationSectionProps {
  canvasBackgroundColor: string;
  onCanvasBackgroundColorChange: (color: string) => void;
  canvasSize: keyof typeof CANVAS_CONFIG.CANVAS_SIZE_PRESETS | 'custom';
  onCanvasSizeChange: (size: keyof typeof CANVAS_CONFIG.CANVAS_SIZE_PRESETS | 'custom') => void;
  customWidth: number;
  onCustomWidthChange: (width: number) => void;
  customHeight: number;
  onCustomHeightChange: (height: number) => void;
  disabled?: boolean;
}

const CanvasConfigurationSection: React.FC<CanvasConfigurationSectionProps> = ({
  canvasBackgroundColor,
  onCanvasBackgroundColorChange,
  canvasSize,
  onCanvasSizeChange,
  customWidth,
  onCustomWidthChange,
  customHeight,
  onCustomHeightChange,
  disabled = false,
}) => {
  const { t } = useTranslation(['board', 'common']);

  const getTranslationKey = (sizeKey: string): string => {
    const keyMap: Record<string, string> = {
      WIDESCREEN: 'widescreen',
      SQUARE: 'square',
      PORTRAIT: 'portrait',
      DOCUMENT: 'document',
    };
    return keyMap[sizeKey] ?? sizeKey.toLowerCase();
  };

  return (
    <SectionCard title={t('board:createForm.label.canvasSettings')} variant="default" padding="md">
      <div className={styles.field}>
        <label htmlFor="board-canvas-background">
          <Monitor size={14} />
          {t('board:createForm.label.canvasBackground')}
        </label>
        <div className={utilStyles.settingRow}>
          <div className={utilStyles.colorPickerPopupWrapper}>
            <ColorPicker
              id="board-canvas-background"
              color={canvasBackgroundColor}
              onChange={onCanvasBackgroundColorChange}
              disabled={disabled}
            />
          </div>
          <span className={utilStyles.settingValue}>
            {(() => {
              const colorName = getColorName(canvasBackgroundColor);
              return colorName ? t(`common:colors.${colorName}`) : canvasBackgroundColor;
            })()}
          </span>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="board-canvas-size">
          <Monitor size={14} />
          {t('board:createForm.label.canvasSize')}
        </label>
        <div className={styles.canvasSizeOptions}>
          <RadioGroup
            id="board-canvas-size"
            value={canvasSize}
            onValueChange={(value) => onCanvasSizeChange(value as typeof canvasSize)}
            name="canvasSize"
            disabled={disabled}
            orientation="vertical"
            options={[
              ...CANVAS_CONFIG.PRESET_ORDER.map((size) => {
                const preset = CANVAS_CONFIG.CANVAS_SIZE_PRESETS[size];
                return {
                  value: size,
                  label: (
                    <div className={styles.presetLabel}>
                      <span className={styles.presetName}>
                        {t(`board:canvasSize.presets.${getTranslationKey(size)}.label`)}
                      </span>
                      <span className={styles.presetInfo}>
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
                  <div className={styles.presetLabel}>
                    <span className={styles.presetName}>{t('board:canvasSize.custom.label')}</span>
                    <span className={styles.presetInfo} />
                  </div>
                ),
                ariaLabel: t('board:canvasSize.custom.label'),
              },
            ]}
          />
          <input type="hidden" name="canvasSize" value={canvasSize} />
        </div>
        {canvasSize === 'custom' && (
          <div className={styles.customSizeInputs}>
            <Input
              id="canvas-custom-width"
              name="customWidth"
              type="number"
              value={customWidth}
              onChange={(e) =>
                onCustomWidthChange(parseInt(e.target.value) ?? CANVAS_CONFIG.DEFAULT_WIDTH)
              }
              min={CANVAS_CONFIG.MIN_WIDTH}
              max={CANVAS_CONFIG.MAX_WIDTH}
              disabled={disabled}
              placeholder={t('board:createForm.placeholder.width')}
            />
            <span>×</span>
            <Input
              id="canvas-custom-height"
              name="customHeight"
              type="number"
              value={customHeight}
              onChange={(e) =>
                onCustomHeightChange(parseInt(e.target.value) ?? CANVAS_CONFIG.DEFAULT_HEIGHT)
              }
              min={CANVAS_CONFIG.MIN_HEIGHT}
              max={CANVAS_CONFIG.MAX_HEIGHT}
              disabled={disabled}
              placeholder={t('board:createForm.placeholder.height')}
            />
            <span>{t('board:createForm.label.pixels')}</span>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default CanvasConfigurationSection;
