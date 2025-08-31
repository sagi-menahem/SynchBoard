import React, { useCallback, useRef, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import Button from 'shared/ui/components/forms/Button';

import styles from './ResizableSplitPanel.module.scss';

interface ResizableSplitPanelProps {
  leftChild: React.ReactNode;
  rightChild: React.ReactNode;
  initialSplitRatio?: number;
  minLeftWidth?: number;
  minRightWidth?: number;
  onSplitChange?: (splitRatio: number) => void;
}

const ResizableSplitPanel: React.FC<ResizableSplitPanelProps> = ({
  leftChild,
  rightChild,
  initialSplitRatio = 70,
  minLeftWidth = 200,
  minRightWidth = 200,
  onSplitChange,
}) => {
  const { t } = useTranslation(['common']);
  const [splitRatio, setSplitRatio] = useState(initialSplitRatio);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) {return;}

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

      const clampedRatio = Math.max(
        minLeftRatio,
        Math.min(100 - minRightRatio, newSplitRatio),
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
    <div ref={containerRef} className={styles.container}>
      <div 
        className={styles.leftPanel} 
        style={{ flexBasis: `${splitRatio}%` }}
      >
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
      
      <div 
        className={styles.rightPanel} 
        style={{ flexBasis: `${100 - splitRatio}%` }}
      >
        {rightChild}
      </div>
    </div>
  );
};

export default ResizableSplitPanel;