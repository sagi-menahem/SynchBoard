import { TOOLS } from 'features/board/constants/BoardConstants';
import { useToolPreferences } from 'features/settings/ToolPreferencesProvider';
import { Circle, Hexagon, Pentagon, Square, Star, Triangle } from 'lucide-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { Tool } from 'shared/types/CommonTypes';

import styles from './satellites.module.scss';

/**
 * Props for ShapesSatellite component.
 */
interface ShapesSatelliteProps {
  /** Callback to close the satellite after shape selection */
  onClose: () => void;
}

/**
 * Shape tool definition.
 */
interface ShapeTool {
  tool: string;
  /** i18n key under 'board:toolbar.tool' namespace */
  labelKey: string;
  icon: React.ReactNode;
}

const SHAPE_TOOLS: ShapeTool[] = [
  { tool: TOOLS.SQUARE, labelKey: 'square', icon: <Square size={24} /> },
  { tool: TOOLS.CIRCLE, labelKey: 'circle', icon: <Circle size={24} /> },
  { tool: TOOLS.TRIANGLE, labelKey: 'triangle', icon: <Triangle size={24} /> },
  { tool: TOOLS.PENTAGON, labelKey: 'pentagon', icon: <Pentagon size={24} /> },
  { tool: TOOLS.HEXAGON, labelKey: 'hexagon', icon: <Hexagon size={24} /> },
  { tool: TOOLS.STAR, labelKey: 'star', icon: <Star size={24} /> },
];

/**
 * ShapesSatellite component - Interactive shape tool selector.
 *
 * Features:
 * - 6 shape tools in 3×2 grid layout
 * - Visual active state for currently selected tool
 * - Auto-closes satellite and collapses toolbar on mobile after selection
 * - Syncs with global tool preferences
 * - Compact, centered design matching StrokeWidthSatellite
 *
 * Phase 3B Implementation
 */
export const ShapesSatellite: React.FC<ShapesSatelliteProps> = ({ onClose }) => {
  const { t } = useTranslation(['board']);
  const { preferences, updateTool } = useToolPreferences();

  const handleShapeSelect = useCallback(
    async (tool: string) => {
      try {
        await updateTool(tool as Tool);
        // Close satellite after successful selection
        onClose();
      } catch {
        // Error handling is managed by useToolPreferences
        // Errors are displayed via the preferences context error state
      }
    },
    [updateTool, onClose],
  );

  return (
    <div className={styles.satelliteContent}>
      <div className={styles.satelliteHeader}>{t('board:toolbar.tool.shapes')}</div>

      <div className={styles.shapeGrid}>
        {SHAPE_TOOLS.map((shapeTool) => {
          const isActive = preferences.defaultTool === shapeTool.tool;
          const label = t(`board:toolbar.tool.${shapeTool.labelKey}`);
          return (
            <button
              key={shapeTool.tool}
              className={`${styles.shapeButton} ${isActive ? styles.active : ''}`}
              onClick={() => handleShapeSelect(shapeTool.tool)}
              title={label}
              aria-label={label}
              aria-pressed={isActive}
            >
              {shapeTool.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
};
