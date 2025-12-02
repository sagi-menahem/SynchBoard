import { CANVAS_CONFIG } from 'features/board/constants/BoardConstants';
import { useCanvasSettings } from 'features/board/hooks/useCanvasSettings';
import type { BoardDetails, UpdateCanvasSettingsRequest } from 'features/board/types/BoardTypes';
import { Save, Settings2, X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ColorPicker, Input, SectionCard, SegmentedControl } from 'shared/ui';
import utilStyles from 'shared/ui/styles/utils.module.scss';
import { getColorName } from 'shared/utils/ColorUtils';

import styles from './CanvasSettingsSection.module.scss';

/**
 * Props interface for CanvasSettingsSection component.
 * Defines the board data, permissions, and update handlers for canvas configuration.
 */
interface CanvasSettingsSectionProps {
  /** Board details including current canvas dimensions and background color */
  boardDetails: BoardDetails;
  /** Whether the current user has admin privileges to modify canvas settings */
  isAdmin: boolean;
  /** Handler for updating canvas settings with async validation */
  onUpdateSettings: (settings: UpdateCanvasSettingsRequest) => Promise<void>;
}

/**
 * Renders canvas configuration interface with background color and size controls.
 * This component provides a comprehensive settings panel for canvas customization,
 * supporting both preset dimensions and custom sizing with admin-controlled editing modes.
 *
 * @param boardDetails - Board details including current canvas dimensions and background color
 * @param isAdmin - Whether the current user has admin privileges to modify canvas settings
 * @param onUpdateSettings - Handler for updating canvas settings with async validation
 */
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
      <SectionCard title={t('board:details.canvasSettings.title')} variant="default">
        <div className={styles.settingsContainer}>
          <label className={styles.settingLabel}>
            {t('board:details.canvasSettings.backgroundColor')}:
          </label>
          <div className={styles.flexRow}>
            <div
              className={styles.colorPreview}
              style={{ backgroundColor: boardDetails.canvasBackgroundColor }}
              title={boardDetails.canvasBackgroundColor}
            />
            <span>
              {(() => {
                const colorName = getColorName(boardDetails.canvasBackgroundColor);
                return colorName
                  ? t(`common:colors.${colorName}`)
                  : boardDetails.canvasBackgroundColor;
              })()}
            </span>
          </div>
        </div>
        <div>
          <label className={styles.settingLabel}>{t('board:details.canvasSettings.size')}:</label>
          <p>
            {boardDetails.canvasWidth} × {boardDetails.canvasHeight}{' '}
            {t('board:details.canvasSettings.pixels')}
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
          <Button
            onClick={handleStartEditing}
            variant="secondary-glass"
            className={`${styles.editButton} ${styles.themeButton}`}
          >
            <Settings2 size={16} />
            {t('board:details.canvasSettings.edit')}
          </Button>
        ) : undefined
      }
    >
      {isEditing ? (
        <>
          <div className={styles.settingsContainerLarge}>
            <label className={styles.settingLabel}>
              {t('board:details.canvasSettings.backgroundColor')}
            </label>
            <div className={styles.flexRowWithMargin}>
              <div className={utilStyles.colorPickerPopupWrapper}>
                <ColorPicker
                  color={backgroundColor}
                  onChange={setBackgroundColor}
                  disabled={isUpdating}
                />
              </div>
              <span>
                {(() => {
                  const colorName = getColorName(backgroundColor);
                  return colorName ? t(`common:colors.${colorName}`) : backgroundColor;
                })()}
              </span>
            </div>
          </div>

          <div className={styles.settingsContainerLarge}>
            <label className={styles.settingLabel}>{t('board:details.canvasSettings.size')}</label>
            <div style={{ marginTop: '0.5rem' }}>
              <SegmentedControl
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
              </div>
            )}
          </div>

          <div className={styles.buttonGroup}>
            <Button onClick={handleCancel} disabled={isUpdating} variant="secondary-glass">
              <X size={16} />
              {t('common:button.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isUpdating} variant="primary-glass">
              <Save size={16} />
              {isUpdating
                ? t('common:button.saving')
                : t('board:details.canvasSettings.applyChanges')}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.settingsContainer}>
            <label className={styles.settingLabel}>
              {t('board:details.canvasSettings.backgroundColor')}:
            </label>
            <div className={styles.flexRow}>
              <div
                className={styles.colorPreview}
                style={{ backgroundColor: boardDetails.canvasBackgroundColor }}
                title={boardDetails.canvasBackgroundColor}
              />
              <span>
                {(() => {
                  const colorName = getColorName(boardDetails.canvasBackgroundColor);
                  return colorName
                    ? t(`common:colors.${colorName}`)
                    : boardDetails.canvasBackgroundColor;
                })()}
              </span>
            </div>
          </div>
          <div>
            <label className={styles.settingLabel}>{t('board:details.canvasSettings.size')}:</label>
            <p>
              {boardDetails.canvasWidth} × {boardDetails.canvasHeight}{' '}
              {t('board:details.canvasSettings.pixels')}
            </p>
          </div>
        </>
      )}
    </SectionCard>
  );
};

export default CanvasSettingsSection;
