import React, { useState } from 'react';

import { CANVAS_CONFIG } from 'features/board/constants/BoardConstants';
import type { BoardDetails, UpdateCanvasSettingsRequest } from 'features/board/types/BoardTypes';
import settingsStyles from 'features/settings/pages/SettingsPage.module.scss';
import { Save, Settings2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ColorPicker, Input, RadioGroup } from 'shared/ui';
import { getColorName } from 'shared/utils/ColorUtils';

import styles from './CanvasSettingsSection.module.scss';

interface CanvasSettingsSectionProps {
  boardDetails: BoardDetails;
  isAdmin: boolean;
  onUpdateSettings: (settings: UpdateCanvasSettingsRequest) => Promise<void>;
}

const CanvasSettingsSection: React.FC<CanvasSettingsSectionProps> = ({
  boardDetails,
  isAdmin,
  onUpdateSettings,
}) => {
  const { t } = useTranslation(['board', 'common']);
  
  const getTranslationKey = (sizeKey: string): string => {
    const keyMap: Record<string, string> = {
      'WIDESCREEN': 'widescreen',
      'SQUARE': 'square',
      'PORTRAIT': 'portrait',
      'DOCUMENT': 'document',
    };
    return keyMap[sizeKey] ?? sizeKey.toLowerCase();
  };
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [backgroundColor, setBackgroundColor] = useState(boardDetails.canvasBackgroundColor);
  const [canvasSize, setCanvasSize] = useState<keyof typeof CANVAS_CONFIG.CANVAS_SIZE_PRESETS | 'custom'>(() => {
    // Determine current size preset or custom
    const presets = CANVAS_CONFIG.CANVAS_SIZE_PRESETS;
    for (const [key, preset] of Object.entries(presets)) {
      if (boardDetails.canvasWidth === preset.width && boardDetails.canvasHeight === preset.height) {
        return key as keyof typeof CANVAS_CONFIG.CANVAS_SIZE_PRESETS;
      }
    }
    return 'custom';
  });
  const [customWidth, setCustomWidth] = useState(boardDetails.canvasWidth);
  const [customHeight, setCustomHeight] = useState(boardDetails.canvasHeight);

  const handleCancel = () => {
    setBackgroundColor(boardDetails.canvasBackgroundColor);
    setCustomWidth(boardDetails.canvasWidth);
    setCustomHeight(boardDetails.canvasHeight);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      let width, height;
      if (canvasSize === 'custom') {
        width = customWidth;
        height = customHeight;
      } else {
        const preset = CANVAS_CONFIG.CANVAS_SIZE_PRESETS[canvasSize];
        width = preset.width;
        height = preset.height;
      }

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

  if (!isAdmin) {
    return (
      <section className={settingsStyles.section}>
        <h2 className={settingsStyles.sectionTitle}>{t('board:details.canvasSettings.title')}</h2>
        <div className={settingsStyles.field}>
          <label className={settingsStyles.field} style={{ marginBottom: '0.5rem' }}>
            {t('board:details.canvasSettings.backgroundColor')}:
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div 
              className={styles.colorPreview} 
              style={{ backgroundColor: boardDetails.canvasBackgroundColor }}
              title={boardDetails.canvasBackgroundColor}
            />
            <span>
              {(() => {
                const colorName = getColorName(boardDetails.canvasBackgroundColor);
                return colorName ? t(`common:colors.${colorName}`) : boardDetails.canvasBackgroundColor;
              })()}
            </span>
          </div>
        </div>
        <div className={settingsStyles.field}>
          <label style={{ marginBottom: '0.5rem' }}>
            {t('board:details.canvasSettings.size')}:
          </label>
          <p>
            {boardDetails.canvasWidth} × {boardDetails.canvasHeight} {t('board:details.canvasSettings.pixels')}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={settingsStyles.section}>
      <div className={settingsStyles.sectionHeader}>
        <h2 className={settingsStyles.sectionTitle}>{t('board:details.canvasSettings.title')}</h2>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="secondary" className={settingsStyles.editButton}>
            <Settings2 size={16} />
            {t('board:details.canvasSettings.edit')}
          </Button>
        )}
      </div>

      {isEditing ? (
        <>
          <div className={settingsStyles.field}>
            <label>{t('board:details.canvasSettings.backgroundColor')}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <ColorPicker
                color={backgroundColor}
                onChange={setBackgroundColor}
                disabled={isUpdating}
              />
              <span>
                {(() => {
                  const colorName = getColorName(backgroundColor);
                  return colorName ? t(`common:colors.${colorName}`) : backgroundColor;
                })()}
              </span>
            </div>
          </div>

          <div className={settingsStyles.field}>
            <label>{t('board:details.canvasSettings.size')}</label>
            <div style={{ marginTop: '0.5rem' }}>
              <RadioGroup
                value={canvasSize}
                onValueChange={(value) => setCanvasSize(value as typeof canvasSize)}
                disabled={isUpdating}
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
                        <span className={styles.presetName}>
                          {t('board:canvasSize.custom.label')}
                        </span>
                        <span className={styles.presetInfo} />
                      </div>
                    ),
                    ariaLabel: t('board:canvasSize.custom.label'),
                  },
                ]}
              />
            </div>
            {canvasSize === 'custom' && (
              <div className={styles.customSizeInputs}>
                <Input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(parseInt(e.target.value) ?? boardDetails.canvasWidth)}
                  min={CANVAS_CONFIG.MIN_WIDTH}
                  max={CANVAS_CONFIG.MAX_WIDTH}
                  disabled={isUpdating}
                  placeholder={t('board:details.canvasSettings.width')}
                />
                <span>×</span>
                <Input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(parseInt(e.target.value) ?? boardDetails.canvasHeight)}
                  min={CANVAS_CONFIG.MIN_HEIGHT}
                  max={CANVAS_CONFIG.MAX_HEIGHT}
                  disabled={isUpdating}
                  placeholder={t('board:details.canvasSettings.height')}
                />
                <span>{t('board:details.canvasSettings.pixels')}</span>
              </div>
            )}
          </div>

          <div className={settingsStyles.buttonGroup}>
            <Button 
              onClick={handleCancel} 
              disabled={isUpdating} 
              variant="secondary"
            >
              <X size={16} />
              {t('common:button.cancel')}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isUpdating}
              variant="secondary"
            >
              <Save size={16} />
              {isUpdating ? t('common:button.saving') : t('board:details.canvasSettings.applyChanges')}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className={settingsStyles.field}>
            <label style={{ marginBottom: '0.5rem' }}>
              {t('board:details.canvasSettings.backgroundColor')}:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div 
                className={styles.colorPreview} 
                style={{ backgroundColor: boardDetails.canvasBackgroundColor }}
                title={boardDetails.canvasBackgroundColor}
              />
              <span>
                {(() => {
                  const colorName = getColorName(boardDetails.canvasBackgroundColor);
                  return colorName ? t(`common:colors.${colorName}`) : boardDetails.canvasBackgroundColor;
                })()}
              </span>
            </div>
          </div>
          <div className={settingsStyles.field}>
            <label style={{ marginBottom: '0.5rem' }}>
              {t('board:details.canvasSettings.size')}:
            </label>
            <p>
              {boardDetails.canvasWidth} × {boardDetails.canvasHeight} {t('board:details.canvasSettings.pixels')}
            </p>
          </div>
        </>
      )}
    </section>
  );
};

export default CanvasSettingsSection;