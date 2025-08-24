import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Button, Input } from 'components/common';
import { CANVAS_CONFIG } from 'constants/BoardConstants';
import type { BoardDetails, UpdateCanvasSettingsRequest } from 'types/BoardTypes';

import styles from './CanvasSettingsSection.module.css';

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
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [backgroundColor, setBackgroundColor] = useState(boardDetails.canvasBackgroundColor);
  const [canvasSize, setCanvasSize] = useState<'small' | 'medium' | 'large' | 'custom'>(() => {
    // Determine current size preset or custom
    const presets = CANVAS_CONFIG.SIZE_PRESETS;
    if (boardDetails.canvasWidth === presets.SMALL.width && boardDetails.canvasHeight === presets.SMALL.height) {
      return 'small';
    }
    if (boardDetails.canvasWidth === presets.MEDIUM.width && boardDetails.canvasHeight === presets.MEDIUM.height) {
      return 'medium';
    }
    if (boardDetails.canvasWidth === presets.LARGE.width && boardDetails.canvasHeight === presets.LARGE.height) {
      return 'large';
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
        const preset = CANVAS_CONFIG.SIZE_PRESETS[canvasSize.toUpperCase() as keyof typeof CANVAS_CONFIG.SIZE_PRESETS];
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
            />
            <span className={styles.settingValue}>{boardDetails.canvasBackgroundColor}</span>
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
            <label htmlFor="canvas-bg-color" className={styles.fieldLabel}>
              {t('boardDetails.canvasSettings.backgroundColor')}
            </label>
            <input
              id="canvas-bg-color"
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              disabled={isUpdating}
              className={styles.colorInput}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>{t('boardDetails.canvasSettings.size')}</label>
            <div className={styles.sizeOptions}>
              {(['small', 'medium', 'large', 'custom'] as const).map((size) => (
                <label key={size} className={styles.radioOption}>
                  <input
                    type="radio"
                    value={size}
                    checked={canvasSize === size}
                    onChange={(e) => setCanvasSize(e.target.value as typeof canvasSize)}
                    disabled={isUpdating}
                  />
                  {size === 'custom' 
                    ? t('boardDetails.canvasSettings.custom') 
                    : `${t(`boardDetails.canvasSettings.${size}`)} (${CANVAS_CONFIG.SIZE_PRESETS[size.toUpperCase() as keyof typeof CANVAS_CONFIG.SIZE_PRESETS].width}×${CANVAS_CONFIG.SIZE_PRESETS[size.toUpperCase() as keyof typeof CANVAS_CONFIG.SIZE_PRESETS].height})`
                  }
                </label>
              ))}
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
            />
            <span className={styles.settingValue}>{boardDetails.canvasBackgroundColor}</span>
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