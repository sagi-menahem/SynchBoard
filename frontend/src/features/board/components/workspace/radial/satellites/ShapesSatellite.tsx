import { TOOLS } from 'features/board/constants/BoardConstants';
import { useToolPreferences } from 'features/settings/ToolPreferencesProvider';
import { Circle, Hexagon, Pentagon, Square, Star, Triangle } from 'lucide-react';
import React, { useCallback } from 'react';
import type { Tool } from 'shared/types/CommonTypes';

import styles from './satellites.module.scss';

/**
 * Props for ShapesSatellite component.
 */
interface ShapesSatelliteProps {
  /** Callback to close the satellite after shape selection */
  onClose: () => void;
  /** Whether device is mobile */
  isMobile: boolean;
  /** Handler to collapse the toolbar (mobile only) */
  onCollapse: () => void;
}

/**
 * Shape tool definition.
 */
interface ShapeTool {
  tool: string;
  label: string;
  icon: React.ReactNode;
}

const SHAPE_TOOLS: ShapeTool[] = [
  { tool: TOOLS.SQUARE, label: 'Square', icon: <Square size={24} /> },
  { tool: TOOLS.CIRCLE, label: 'Circle', icon: <Circle size={24} /> },
  { tool: TOOLS.TRIANGLE, label: 'Triangle', icon: <Triangle size={24} /> },
  { tool: TOOLS.PENTAGON, label: 'Pentagon', icon: <Pentagon size={24} /> },
  { tool: TOOLS.HEXAGON, label: 'Hexagon', icon: <Hexagon size={24} /> },
  { tool: TOOLS.STAR, label: 'Star', icon: <Star size={24} /> },
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
export const ShapesSatellite: React.FC<ShapesSatelliteProps> = ({
  onClose,
  isMobile,
  onCollapse,
}) => {
  const { preferences, updateTool } = useToolPreferences();

  const handleShapeSelect = useCallback(
    async (tool: string) => {
      try {
        await updateTool(tool as Tool);
        // Close satellite after successful selection
        onClose();
        // Auto-collapse toolbar on mobile after shape selection
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
      <div className={styles.satelliteHeader}>Shapes</div>

      <div className={styles.shapeGrid}>
        {SHAPE_TOOLS.map((shapeTool) => {
          const isActive = preferences.defaultTool === shapeTool.tool;
          return (
            <button
              key={shapeTool.tool}
              className={`${styles.shapeButton} ${isActive ? styles.active : ''}`}
              onClick={() => handleShapeSelect(shapeTool.tool)}
              title={shapeTool.label}
              aria-label={shapeTool.label}
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
