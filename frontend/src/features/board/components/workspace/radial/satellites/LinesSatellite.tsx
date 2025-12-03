import { TOOLS } from 'features/board/constants/BoardConstants';
import { useToolPreferences } from 'features/settings/ToolPreferencesProvider';
import { ArrowRight, Minus, MoreHorizontal } from 'lucide-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { Tool } from 'shared/types/CommonTypes';

import styles from './satellites.module.scss';

/**
 * Props for LinesSatellite component.
 */
interface LinesSatelliteProps {
  /** Callback to close the satellite after line tool selection */
  onClose: () => void;
}

/**
 * Line tool definition.
 */
interface LineTool {
  tool: string;
  /** i18n key under 'board:toolbar.tool' namespace */
  labelKey: string;
  icon: React.ReactNode;
}

const LINE_TOOLS: LineTool[] = [
  { tool: TOOLS.LINE, labelKey: 'line', icon: <Minus size={24} /> },
  { tool: TOOLS.ARROW, labelKey: 'arrow', icon: <ArrowRight size={24} /> },
  { tool: TOOLS.DOTTED_LINE, labelKey: 'dottedLine', icon: <MoreHorizontal size={24} /> },
];

/**
 * LinesSatellite component - Interactive line tool selector.
 *
 * Features:
 * - 3 line tools in grid layout
 * - Visual active state for currently selected tool
 * - Auto-closes satellite and collapses toolbar on mobile after selection
 * - Syncs with global tool preferences
 * - Compact, centered design matching ShapesSatellite
 *
 * Phase 3C Implementation
 */
export const LinesSatellite: React.FC<LinesSatelliteProps> = ({ onClose }) => {
  const { t } = useTranslation(['board']);
  const { preferences, updateTool } = useToolPreferences();

  const handleLineSelect = useCallback(
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
      <div className={styles.satelliteHeader}>{t('board:toolbar.tool.lines')}</div>

      <div className={styles.lineGrid}>
        {LINE_TOOLS.map((lineTool) => {
          const isActive = preferences.defaultTool === lineTool.tool;
          const label = t(`board:toolbar.tool.${lineTool.labelKey}`);
          return (
            <button
              key={lineTool.tool}
              className={`${styles.lineButton} ${isActive ? styles.active : ''}`}
              onClick={() => handleLineSelect(lineTool.tool)}
              title={label}
              aria-label={label}
              aria-pressed={isActive}
            >
              {lineTool.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
};
