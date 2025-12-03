import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import React, { useRef } from 'react';

import { TOOLS } from 'features/board/constants/BoardConstants';
import type { Tool } from 'shared/types/CommonTypes';

import { DOCK_TOOLS } from '../constants/RadialDockConstants';
import type { DesktopToolbarProps } from '../types/RadialDockTypes';
import styles from '../RadialDock.module.scss';

/**
 * Desktop toolbar component with horizontal or vertical layout.
 * Features smooth expand/collapse animations using AnimatePresence.
 */
export const DesktopToolbar: React.FC<DesktopToolbarProps> = ({
  isExpanded,
  useVerticalLayout,
  activeToolIcon,
  defaultTool,
  defaultStrokeColor,
  onToggleExpand,
  onToolSelect,
  onOpenSatellite,
  getToolIcon,
  isToolActive,
  getToolLabel,
  collapseLabel,
}) => {
  const toolbarContentRef = useRef<HTMLDivElement>(null);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isExpanded ? (
        <motion.button
          key="collapsed-trigger"
          className={styles.collapsedTrigger}
          onClick={onToggleExpand}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{
            duration: 0.12,
            ease: 'easeOut',
          }}
        >
          <div>{activeToolIcon}</div>
          {defaultTool !== TOOLS.ERASER && (
            <div
              className={styles.collapsedColorIndicator}
              style={{ backgroundColor: defaultStrokeColor }}
            />
          )}
        </motion.button>
      ) : (
        <motion.div
          key="expanded-toolbar"
          ref={toolbarContentRef}
          className={`${styles.expandedToolbar} ${useVerticalLayout ? styles.verticalToolbar : ''}`}
          initial={useVerticalLayout ? { height: 56, opacity: 0.5 } : { width: 56, opacity: 0.5 }}
          animate={
            useVerticalLayout ? { height: 'auto', opacity: 1 } : { width: 'auto', opacity: 1 }
          }
          exit={useVerticalLayout ? { height: 56, opacity: 0.5 } : { width: 56, opacity: 0.5 }}
          transition={{
            duration: 0.18,
            ease: [0.4, 0, 0.2, 1],
            opacity: { duration: 0.1 },
          }}
        >
          <motion.div
            className={`${styles.toolsRow} ${useVerticalLayout ? styles.toolsColumn : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
          >
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
                  {getToolIcon(item, 20)}
                </button>
              );
            })}

            {/* Close button integrated into toolbar */}
            <button
              className={styles.closeButton}
              onClick={onToggleExpand}
              title={collapseLabel}
            >
              <ChevronUp size={20} className={styles.closeIcon} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DesktopToolbar;
