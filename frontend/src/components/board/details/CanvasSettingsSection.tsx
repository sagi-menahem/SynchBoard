import React, { useState, useRef } from 'react';

import { useTranslation } from 'react-i18next';
import { getColorName } from 'utils/ColorUtils';

import { Button, Input, ColorPicker } from 'components/common';
import { CANVAS_CONFIG } from 'constants/BoardConstants';
import type { BoardDetails, UpdateCanvasSettingsRequest } from 'types/BoardTypes';

import styles from './CanvasSettingsSection.module.css';
import utilStyles from 'components/common/utils.module.css';

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
  const { t } = useTranslation();
  
  const getTranslationKey = (sizeKey: string): string => {
    const keyMap: Record<string, string> = {
      'WIDESCREEN': 'widescreen',
      'SQUARE': 'square',
      'PORTRAIT': 'portrait',
      'DOCUMENT': 'document',
    };
    return keyMap[sizeKey] || sizeKey.toLowerCase();
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
        const preset = CANVAS_CONFIG.CANVAS_SIZE_PRESETS[canvasSize as keyof typeof CANVAS_CONFIG.CANVAS_SIZE_PRESETS];
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
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>{t('boardDetails.canvasSettings.title')}</h4>
        <div className={styles.readOnlySettings}>
          <div className={styles.settingRow}>
            <span className={styles.settingLabel}>{t('boardDetails.canvasSettings.backgroundColor')}:</span>
            <div 
              className={styles.colorPreview} 
              style={{ backgroundColor: boardDetails.canvasBackgroundColor }}
              title={boardDetails.canvasBackgroundColor}
            />
            <span className={styles.settingValue}>
              {(() => {
                const colorName = getColorName(boardDetails.canvasBackgroundColor);
                return colorName ? t(`colors.${colorName}`) : boardDetails.canvasBackgroundColor;
              })()}
            </span>
          </div>
          <div className={styles.settingRow}>
            <span className={styles.settingLabel}>{t('boardDetails.canvasSettings.size')}:</span>
            <span className={styles.settingValue}>
              {boardDetails.canvasWidth} × {boardDetails.canvasHeight} {t('boardDetails.canvasSettings.pixels')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h4 className={styles.sectionTitle}>{t('boardDetails.canvasSettings.title')}</h4>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="secondary" className={styles.editButton}>
            {t('boardDetails.canvasSettings.edit')}
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className={styles.editForm}>
          <div className={styles.formField}>
            <div className={utilStyles.settingRow}>
              <span className={utilStyles.settingLabel}>{t('boardDetails.canvasSettings.backgroundColor')}:</span>
              <ColorPicker
                color={backgroundColor}
                onChange={setBackgroundColor}
                disabled={isUpdating}
              />
              <span className={utilStyles.settingValue}>
                {(() => {
                  const colorName = getColorName(backgroundColor);
                  return colorName ? t(`colors.${colorName}`) : backgroundColor;
                })()}
              </span>
            </div>
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>{t('boardDetails.canvasSettings.size')}</label>
            <div className={styles.sizeOptions}>
              {/* Canvas Size Presets */}
              <div className={styles.sizeGroup}>
                {CANVAS_CONFIG.PRESET_ORDER.map((size) => {
                  const preset = CANVAS_CONFIG.CANVAS_SIZE_PRESETS[size];
                  return (
                    <label key={size} className={styles.radioOption}>
                      <input
                        type="radio"
                        value={size}
                        checked={canvasSize === size}
                        onChange={(e) => setCanvasSize(e.target.value as typeof canvasSize)}
                        disabled={isUpdating}
                      />
                      <div className={styles.presetLabel}>
                        <span className={styles.presetName}>
                          {t(`canvasSize.presets.${getTranslationKey(size)}.label`)}
                        </span>
                        <span className={styles.presetInfo}>
                          ({preset.ratio}) - {preset.width}×{preset.height}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
              
              {/* Custom Option */}
              <div className={styles.sizeGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    value="custom"
                    checked={canvasSize === 'custom'}
                    onChange={(e) => setCanvasSize(e.target.value as typeof canvasSize)}
                    disabled={isUpdating}
                  />
                  <div className={styles.presetLabel}>
                    <span className={styles.presetName}>
                      {t('canvasSize.custom.label')}
                    </span>
                    <span className={styles.presetInfo}>
                      {t('canvasSize.custom.description')}
                    </span>
                  </div>
                </label>
              </div>
            </div>
            {canvasSize === 'custom' && (
              <div className={styles.customSizeInputs}>
                <Input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(parseInt(e.target.value) || boardDetails.canvasWidth)}
                  min={CANVAS_CONFIG.MIN_WIDTH}
                  max={CANVAS_CONFIG.MAX_WIDTH}
                  disabled={isUpdating}
                  placeholder={t('boardDetails.canvasSettings.width')}
                />
                <span>×</span>
                <Input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(parseInt(e.target.value) || boardDetails.canvasHeight)}
                  min={CANVAS_CONFIG.MIN_HEIGHT}
                  max={CANVAS_CONFIG.MAX_HEIGHT}
                  disabled={isUpdating}
                  placeholder={t('boardDetails.canvasSettings.height')}
                />
                <span>{t('boardDetails.canvasSettings.pixels')}</span>
              </div>
            )}
          </div>

          <div className={styles.formActions}>
            <Button 
              onClick={handleCancel} 
              disabled={isUpdating} 
              variant="secondary"
              className={styles.cancelButton}
            >
              {t('common.button.cancel')}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isUpdating}
              variant="primary"
              className={styles.saveButton}
            >
              {isUpdating ? t('common.button.saving') : t('boardDetails.canvasSettings.applyChanges')}
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.readOnlySettings}>
          <div className={styles.settingRow}>
            <span className={styles.settingLabel}>{t('boardDetails.canvasSettings.backgroundColor')}:</span>
            <div 
              className={styles.colorPreview} 
              style={{ backgroundColor: boardDetails.canvasBackgroundColor }}
              title={boardDetails.canvasBackgroundColor}
            />
            <span className={styles.settingValue}>
              {(() => {
                const colorName = getColorName(boardDetails.canvasBackgroundColor);
                return colorName ? t(`colors.${colorName}`) : boardDetails.canvasBackgroundColor;
              })()}
            </span>
          </div>
          <div className={styles.settingRow}>
            <span className={styles.settingLabel}>{t('boardDetails.canvasSettings.size')}:</span>
            <span className={styles.settingValue}>
              {boardDetails.canvasWidth} × {boardDetails.canvasHeight} {t('boardDetails.canvasSettings.pixels')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasSettingsSection;