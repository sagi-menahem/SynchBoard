import { motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import React from 'react';

import { TOOLS } from 'features/board/constants/BoardConstants';
import type { Tool } from 'shared/types/CommonTypes';

import { DOCK_TOOLS, TOOLBAR_HEIGHT_MOBILE } from '../constants/RadialDockConstants';
import type { MobileToolbarProps } from '../types/RadialDockTypes';
import styles from '../RadialDock.module.scss';

/**
 * Mobile toolbar component with bottom sheet style.
 * Features a collapsible tab with drag gesture support.
 */
export const MobileToolbar: React.FC<MobileToolbarProps> = ({
  isExpanded,
  isDragging,
  toolbarHeight,
  activeToolIcon,
  defaultTool,
  defaultStrokeColor,
  onToggleExpand,
  onToolSelect,
  onOpenSatellite,
  dragHandlers,
  getToolIcon,
  isToolActive,
  getToolLabel,
}) => {
  const { handleDragStart, handleDrag, handleDragEnd } = dragHandlers;

  return (
    <div className={styles.mobileToolbarContainer} data-testid="mobile-toolbar-container">
      {/* The tab - sits on top, pan gestures control toolbar height (tab doesn't move) */}
      <motion.button
        className={styles.collapsedTrigger}
        data-testid="mobile-tab"
        onClick={onToggleExpand}
        onPanStart={handleDragStart}
        onPan={handleDrag}
        onPanEnd={handleDragEnd}
        style={{ touchAction: 'none' }}
      >
        {/* Chevron indicator - points up when closed (to open), down when open (to close) */}
        {/* Uses muted gray for subtle visual hierarchy - arrow is secondary UI element */}
        <motion.div
          className={styles.chevronIndicator}
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronUp size={16} />
        </motion.div>
        {/* Tool icon colored with current stroke color (or primary text for eraser) */}
        <div
          className={styles.mobileTabToolIcon}
          style={{
            color:
              defaultTool === TOOLS.ERASER ? 'var(--color-text-primary)' : defaultStrokeColor,
          }}
        >
          {activeToolIcon}
        </div>
      </motion.button>

      {/* Toolbar - expands downward below the tab */}
      <motion.div
        className={`${styles.expandedToolbar} ${styles.mobileToolbar}`}
        data-testid="mobile-toolbar"
        data-expanded={isExpanded}
        initial={false}
        animate={{
          height: isDragging ? toolbarHeight : isExpanded ? TOOLBAR_HEIGHT_MOBILE : 0,
        }}
        transition={
          isDragging
            ? { duration: 0 }
            : {
                type: 'spring',
                stiffness: 400,
                damping: 28,
              }
        }
      >
        {/* Inner wrapper holds padding - gets clipped by overflow:hidden on parent */}
        <div className={styles.mobileToolbarContent}>
          <div className={styles.toolsGrid}>
            {DOCK_TOOLS.map((item) => {
              const isActive = isToolActive(item);
              const label = getToolLabel(item.labelKey);
              return (
                <button
                  key={item.labelKey}
                  className={`${styles.toolButton} ${isActive ? styles.active : ''}`}
                  onClick={() =>
                    item.type === 'direct'
                      ? onToolSelect(item.tool as Tool)
                      : onOpenSatellite(item.tool as string)
                  }
                  title={label}
                >
                  {/* Wrapper for icon + indicator (same structure as colorPaletteIcon) */}
                  <div className={styles.toolIconWrapper}>
                    {getToolIcon(item, 20)}
                    {/* Underline indicator for active tool - uses stroke color (or primary text for eraser) */}
                    {isActive && (
                      <span
                        className={styles.activeIndicator}
                        style={{
                          backgroundColor:
                            item.tool === TOOLS.ERASER
                              ? 'var(--color-text-primary)'
                              : defaultStrokeColor,
                        }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MobileToolbar;
