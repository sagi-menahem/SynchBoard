
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

  // Get the user's chosen color for CSS variable
  const getUserChosenColor = useCallback(() => {
    const savedVariable = preferences.boardBackgroundSetting;
    // This is now a variable name like '--board-bg-midnight-blue'
    if (!savedVariable) {
      return 'var(--color-surface)'; // Default fallback remains the same
    }
    // Return the value wrapped in the var() function
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

      const isRTL = document.documentElement.dir === 'rtl';
      if (isRTL) {
        mouseX = containerWidth - mouseX;
      }

      const newSplitRatio = (mouseX / containerWidth) * 100;
      const minLeftRatio = (minLeftWidth / containerWidth) * 100;
      const minRightRatio = (minRightWidth / containerWidth) * 100;

      // Enforce 30% minimum for canvas (left panel), 70% maximum for chat (right panel)
      const clampedRatio = Math.max(
        Math.max(minLeftRatio, 30), // Canvas must be at least 30%
        Math.min(Math.min(100 - minRightRatio, 70), newSplitRatio), // Canvas max 70%
      );

      setSplitRatio(clampedRatio);
      onSplitChange?.(clampedRatio);
    },
    [isDragging, minLeftWidth, minRightWidth, onSplitChange],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

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
