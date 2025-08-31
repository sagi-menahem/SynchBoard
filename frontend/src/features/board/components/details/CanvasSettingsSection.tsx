import React from 'react';

import { CANVAS_CONFIG } from 'features/board/constants/BoardConstants';
import { useCanvasSettings } from 'features/board/hooks/useCanvasSettings';
import type { BoardDetails, UpdateCanvasSettingsRequest } from 'features/board/types/BoardTypes';
import { Save, Settings2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ColorPicker, Input, RadioGroup, SectionCard } from 'shared/ui';
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
  
  const {
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
    presetOptions,
  } = useCanvasSettings({ 
    boardDetails, 
    onUpdateSettings, 
    styles: {
      presetLabel: styles.presetLabel,
      presetName: styles.presetName,
      presetInfo: styles.presetInfo,
    },
  });

  if (!isAdmin) {
    return (
      <SectionCard 
        title={t('board:details.canvasSettings.title')}
        variant="default"
      >
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ marginBottom: '0.5rem', display: 'block' }}>
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
        <div>
          <label style={{ marginBottom: '0.5rem', display: 'block' }}>
            {t('board:details.canvasSettings.size')}:
          </label>
          <p>
            {boardDetails.canvasWidth} × {boardDetails.canvasHeight} {t('board:details.canvasSettings.pixels')}
          </p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard 
      title={t('board:details.canvasSettings.title')}
      variant="default"
      headerActions={
        !isEditing ? (
          <Button onClick={handleStartEditing} variant="secondary" className={styles.editButton}>
            <Settings2 size={16} />
            {t('board:details.canvasSettings.edit')}
          </Button>
        ) : undefined
      }
    >

      {isEditing ? (
        <>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('board:details.canvasSettings.backgroundColor')}</label>
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('board:details.canvasSettings.size')}</label>
            <div style={{ marginTop: '0.5rem' }}>
              <RadioGroup
                value={canvasSize}
                onValueChange={handleCanvasSizeChange}
                disabled={isUpdating}
                orientation="vertical"
                options={presetOptions}
              />
            </div>
            {canvasSize === 'custom' && (
              <div className={styles.customSizeInputs}>
                <Input
                  type="number"
                  value={customWidth}
                  onChange={(e) => handleCustomWidthChange(e.target.value)}
                  min={CANVAS_CONFIG.MIN_WIDTH}
                  max={CANVAS_CONFIG.MAX_WIDTH}
                  disabled={isUpdating}
                  placeholder={t('board:details.canvasSettings.width')}
                />
                <span>×</span>
                <Input
                  type="number"
                  value={customHeight}
                  onChange={(e) => handleCustomHeightChange(e.target.value)}
                  min={CANVAS_CONFIG.MIN_HEIGHT}
                  max={CANVAS_CONFIG.MAX_HEIGHT}
                  disabled={isUpdating}
                  placeholder={t('board:details.canvasSettings.height')}
                />
                <span>{t('board:details.canvasSettings.pixels')}</span>
              </div>
            )}
          </div>

          <div className={styles.buttonGroup}>
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
              variant="primary"
            >
              <Save size={16} />
              {isUpdating ? t('common:button.saving') : t('board:details.canvasSettings.applyChanges')}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ marginBottom: '0.5rem', display: 'block' }}>
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
          <div>
            <label style={{ marginBottom: '0.5rem', display: 'block' }}>
              {t('board:details.canvasSettings.size')}:
            </label>
            <p>
              {boardDetails.canvasWidth} × {boardDetails.canvasHeight} {t('board:details.canvasSettings.pixels')}
            </p>
          </div>
        </>
      )}
    </SectionCard>
  );
};

export default CanvasSettingsSection;