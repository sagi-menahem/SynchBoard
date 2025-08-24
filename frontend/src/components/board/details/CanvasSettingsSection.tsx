import React, { useState, useRef } from 'react';

import { useTranslation } from 'react-i18next';
import { HexColorPicker } from 'react-colorful';
import { getColorName } from 'utils/ColorUtils';

import { Button, Input } from 'components/common';
import { CANVAS_CONFIG } from 'constants/BoardConstants';
import { PRESET_COLORS } from 'constants/ColorConstants';
import { useClickOutside } from 'hooks/common/useClickOutside';
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
      'MEDIUM_LANDSCAPE': 'mediumLandscape',
      'LARGE_LANDSCAPE': 'largeLandscape', 
      'EXTRA_LARGE_LANDSCAPE': 'extraLargeLandscape',
      'MEDIUM_PORTRAIT': 'mediumPortrait',
      'LARGE_PORTRAIT': 'largePortrait',
      'EXTRA_LARGE_PORTRAIT': 'extraLargePortrait',
    };
    return keyMap[sizeKey] || sizeKey.toLowerCase();
  };
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  
  const [backgroundColor, setBackgroundColor] = useState(boardDetails.canvasBackgroundColor);
  const [canvasSize, setCanvasSize] = useState<keyof typeof CANVAS_CONFIG.SIZE_PRESETS | 'custom'>(() => {
    // Determine current size preset or custom
    const presets = CANVAS_CONFIG.SIZE_PRESETS;
    for (const [key, preset] of Object.entries(presets)) {
      if (boardDetails.canvasWidth === preset.width && boardDetails.canvasHeight === preset.height) {
        return key as keyof typeof CANVAS_CONFIG.SIZE_PRESETS;
      }
    }
    return 'custom';
  });
  const [customWidth, setCustomWidth] = useState(boardDetails.canvasWidth);
  const [customHeight, setCustomHeight] = useState(boardDetails.canvasHeight);

  useClickOutside(colorPickerRef, () => setShowColorPicker(false), showColorPicker);

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
        const preset = CANVAS_CONFIG.SIZE_PRESETS[canvasSize as keyof typeof CANVAS_CONFIG.SIZE_PRESETS];
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
              <div className={utilStyles.colorPickerWrapper} ref={colorPickerRef}>
                <div 
                  className={`${utilStyles.colorPreview} ${utilStyles.clickableColorPreview} ${isUpdating ? utilStyles.disabled : ''}`}
                  style={{ backgroundColor: backgroundColor }}
                  onClick={() => !isUpdating && setShowColorPicker(!showColorPicker)}
                  title={`${t('boardDetails.canvasSettings.backgroundColor')}: ${backgroundColor}`}
                />
                {showColorPicker && !isUpdating && (
                  <div className={utilStyles.colorPickerPopover}>
                    <HexColorPicker 
                      color={backgroundColor} 
                      onChange={setBackgroundColor}
                    />
                    <div className={utilStyles.presetColors}>
                      {PRESET_COLORS.map((presetColor) => (
                        <button
                          key={presetColor}
                          type="button"
                          className={utilStyles.presetColorButton}
                          style={{ backgroundColor: presetColor }}
                          onClick={() => {
                            setBackgroundColor(presetColor);
                            setShowColorPicker(false);
                          }}
                          title={presetColor}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
              {/* Landscape Options */}
              <div className={styles.sizeGroup}>
                <h5 className={styles.groupLabel}>{t('createBoardForm.canvasSize.landscape')}</h5>
                {(['MEDIUM_LANDSCAPE', 'LARGE_LANDSCAPE', 'EXTRA_LARGE_LANDSCAPE'] as const).map((size) => {
                  const preset = CANVAS_CONFIG.SIZE_PRESETS[size];
                  return (
                    <label key={size} className={styles.radioOption}>
                      <input
                        type="radio"
                        value={size}
                        checked={canvasSize === size}
                        onChange={(e) => setCanvasSize(e.target.value as typeof canvasSize)}
                        disabled={isUpdating}
                      />
                      {t(`createBoardForm.canvasSize.${getTranslationKey(size)}`)} ({preset.width}×{preset.height})
                    </label>
                  );
                })}
              </div>
              
              {/* Portrait Options */}
              <div className={styles.sizeGroup}>
                <h5 className={styles.groupLabel}>{t('createBoardForm.canvasSize.portrait')}</h5>
                {(['MEDIUM_PORTRAIT', 'LARGE_PORTRAIT', 'EXTRA_LARGE_PORTRAIT'] as const).map((size) => {
                  const preset = CANVAS_CONFIG.SIZE_PRESETS[size];
                  return (
                    <label key={size} className={styles.radioOption}>
                      <input
                        type="radio"
                        value={size}
                        checked={canvasSize === size}
                        onChange={(e) => setCanvasSize(e.target.value as typeof canvasSize)}
                        disabled={isUpdating}
                      />
                      {t(`createBoardForm.canvasSize.${getTranslationKey(size)}`)} ({preset.width}×{preset.height})
                    </label>
                  );
                })}
              </div>
              
              {/* Custom Option */}
              <div className={styles.sizeGroup}>
                <h5 className={styles.groupLabel}>{t('createBoardForm.canvasSize.customGroup')}</h5>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    value="custom"
                    checked={canvasSize === 'custom'}
                    onChange={(e) => setCanvasSize(e.target.value as typeof canvasSize)}
                    disabled={isUpdating}
                  />
                  {t('createBoardForm.canvasSize.custom')}
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