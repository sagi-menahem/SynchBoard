import clsx from 'clsx';
import { useUserBoardPreferences } from 'features/settings/UserBoardPreferencesProvider';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import utilStyles from 'shared/ui/styles/utils.module.scss';

import styles from './ResizableSplitPanel.module.scss';

interface ResizableSplitPanelProps {
  leftChild: React.ReactNode;
  rightChild: React.ReactNode;
  initialSplitRatio?: number;
  minLeftWidth?: number;
  minRightWidth?: number;
  onSplitChange?: (splitRatio: number) => void;
  backgroundBlur?: string;
}

/**
 * Resizable split panel component for flexible two-column layouts.
 * This component provides a drag-and-resize interface between two content areas,
 * supporting RTL layouts, keyboard accessibility, and user preference integration.
 * The divider includes visual feedback and maintains minimum width constraints for
 * both panels. It integrates with user board preferences for background styling
 * and provides smooth resize interactions with proper cursor management.
 * 
 * @param leftChild - React component or content for the left panel
 * @param rightChild - React component or content for the right panel
 * @param initialSplitRatio - Initial percentage width of the left panel (defaults to 70%)
 * @param minLeftWidth - Minimum pixel width for the left panel
 * @param minRightWidth - Minimum pixel width for the right panel
 * @param onSplitChange - Callback fired when the split ratio changes
 * @param backgroundBlur - CSS blur value for background styling
 */
const ResizableSplitPanel: React.FC<ResizableSplitPanelProps> = ({
  leftChild,
  rightChild,
  initialSplitRatio = 70,
  minLeftWidth = 200,
  minRightWidth = 200,
  onSplitChange,
  backgroundBlur = '0px',
}) => {
  const { t } = useTranslation(['common']);
  const { preferences } = useUserBoardPreferences();
  const [splitRatio, setSplitRatio] = useState(initialSplitRatio);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get user's chosen background color from preferences
  const getUserChosenColor = useCallback(() => {
    const savedVariable = preferences.boardBackgroundSetting;
    if (!savedVariable) {
      return 'var(--color-surface)';
    }
    return `var(${savedVariable})`;
  }, [preferences.boardBackgroundSetting]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) {
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      let mouseX = e.clientX - containerRect.left;

      // Adjust for RTL layout direction
      const isRTL = document.documentElement.dir === 'rtl';
      if (isRTL) {
        mouseX = containerWidth - mouseX;
      }

      const newSplitRatio = (mouseX / containerWidth) * 100;
      const minLeftRatio = (minLeftWidth / containerWidth) * 100;
      const minRightRatio = (minRightWidth / containerWidth) * 100;

      // Clamp ratio to respect minimum widths and reasonable limits
      const clampedRatio = Math.max(
        Math.max(minLeftRatio, 30),
        Math.min(Math.min(100 - minRightRatio, 70), newSplitRatio),
      );

      setSplitRatio(clampedRatio);
      onSplitChange?.(clampedRatio);
    },
    [isDragging, minLeftWidth, minRightWidth, onSplitChange],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Manage global mouse events and cursor during drag operation
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className={clsx(styles.container, utilStyles.unifiedDotBackground)}
      style={
        {
          '--user-chosen-color': getUserChosenColor(),
          '--background-blur': backgroundBlur,
        } as React.CSSProperties
      }
    >
      <div className={styles.leftPanel} style={{ flexBasis: `${splitRatio}%` }}>
        {leftChild}
      </div>

      <div
        className={clsx(styles.divider, isDragging && styles.dragging)}
        onMouseDown={handleMouseDown}
        role="button"
        tabIndex={0}
        aria-label={t('common:accessibility.resizePanels')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleMouseDown(e as unknown as React.MouseEvent);
          }
        }}
      >
        <div className={styles.dividerLine} />
        <div className={styles.dividerHandle}>
          <div className={styles.handleDot} />
          <div className={styles.handleDot} />
          <div className={styles.handleDot} />
        </div>
      </div>

      <div className={styles.rightPanel} style={{ flexBasis: `${100 - splitRatio}%` }}>
        {rightChild}
      </div>
    </div>
  );
};

export default ResizableSplitPanel;
