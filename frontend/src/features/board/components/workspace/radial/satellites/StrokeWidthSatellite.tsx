import { STROKE_WIDTH_RANGE } from 'features/board/constants/BoardConstants';
import { useToolPreferences } from 'features/settings/ToolPreferencesProvider';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Slider } from 'shared/ui/components/forms/Slider';

import styles from './satellites.module.scss';

/**
 * StrokeWidthSatellite component - Interactive stroke width selector.
 *
 * Features:
 * - Radix UI slider with range 1-50px
 * - Live preview stroke line showing current width
 * - Real-time value display
 * - Syncs with global tool preferences
 * - Smooth animations on value change
 *
 * Phase 3A Implementation - First satellite component
 */
export const StrokeWidthSatellite: React.FC = () => {
  const { t } = useTranslation(['board', 'common']);
  const { preferences, updateStrokeWidth } = useToolPreferences();

  const handleWidthChange = useCallback(
    async (value: number) => {
      try {
        await updateStrokeWidth(value);
      } catch {
        // Error handling is managed by useToolPreferences (optimistic updates with rollback)
        // Errors are displayed via the preferences context error state
      }
    },
    [updateStrokeWidth],
  );

  return (
    <div className={styles.satelliteContent}>
      <div className={styles.satelliteHeader}>{t('board:toolbar.tool.strokeWidth')}</div>

      {/* Slider Control */}
      <Slider
        value={preferences.defaultStrokeWidth}
        onChange={handleWidthChange}
        min={STROKE_WIDTH_RANGE.MIN}
        max={STROKE_WIDTH_RANGE.MAX}
        step={1}
        aria-label={t('common:accessibility.strokeWidth')}
        className={styles.centeredSlider}
      />
    </div>
  );
};
