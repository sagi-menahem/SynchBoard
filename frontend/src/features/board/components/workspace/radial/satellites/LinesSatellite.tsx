import { TOOLS } from 'features/board/constants/BoardConstants';
import { useToolPreferences } from 'features/settings/ToolPreferencesProvider';
import { ArrowRight, Minus, MoreHorizontal } from 'lucide-react';
import React, { useCallback } from 'react';
import type { Tool } from 'shared/types/CommonTypes';

import styles from './satellites.module.scss';

/**
 * Props for LinesSatellite component.
 */
interface LinesSatelliteProps {
  /** Callback to close the satellite after line tool selection */
  onClose: () => void;
  /** Whether device is mobile */
  isMobile: boolean;
  /** Handler to collapse the toolbar (mobile only) */
  onCollapse: () => void;
}

/**
 * Line tool definition.
 */
interface LineTool {
  tool: string;
  label: string;
  icon: React.ReactNode;
}

const LINE_TOOLS: LineTool[] = [
  { tool: TOOLS.LINE, label: 'Line', icon: <Minus size={24} /> },
  { tool: TOOLS.ARROW, label: 'Arrow', icon: <ArrowRight size={24} /> },
  { tool: TOOLS.DOTTED_LINE, label: 'Dotted Line', icon: <MoreHorizontal size={24} /> },
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
export const LinesSatellite: React.FC<LinesSatelliteProps> = ({
  onClose,
  isMobile,
  onCollapse,
}) => {
  const { preferences, updateTool } = useToolPreferences();

  const handleLineSelect = useCallback(
    async (tool: string) => {
      try {
        await updateTool(tool as Tool);
        // Close satellite after successful selection
        onClose();
        // Auto-collapse toolbar on mobile after line selection
        if (isMobile) {
          onCollapse();
        }
      } catch {
        // Error handling is managed by useToolPreferences
        // Errors are displayed via the preferences context error state
      }
    },
    [updateTool, onClose, isMobile, onCollapse],
  );

  return (
    <div className={styles.satelliteContent}>
      <div className={styles.satelliteHeader}>Lines</div>

      <div className={styles.lineGrid}>
        {LINE_TOOLS.map((lineTool) => {
          const isActive = preferences.defaultTool === lineTool.tool;
          return (
            <button
              key={lineTool.tool}
              className={`${styles.lineButton} ${isActive ? styles.active : ''}`}
              onClick={() => handleLineSelect(lineTool.tool)}
              title={lineTool.label}
              aria-label={lineTool.label}
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
