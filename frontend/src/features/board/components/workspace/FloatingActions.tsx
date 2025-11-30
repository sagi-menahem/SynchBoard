import { useBoardContext } from 'features/board/hooks/context/useBoardContext';
import { useCanvasPreferences } from 'features/settings/CanvasPreferencesProvider';
import { motion } from 'framer-motion';
import { MessageSquare, Minus, Plus, Redo2, RotateCcw, Undo2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from 'shared/hooks';
import { Button } from 'shared/ui';
import { isRTL } from 'shared/utils/rtlUtils';

import styles from './FloatingActions.module.scss';

/**
 * Props for FloatingActions component.
 */
interface FloatingActionsProps {
  /** Whether a satellite menu is currently open (used to hide on mobile) */
  isSatelliteOpen?: boolean;
}

/**
 * FloatingActions component - Fixed corner action buttons with RTL/LTR awareness.
 *
 * Features:
 * - LTR (English): Positioned at bottom-left
 * - RTL (Hebrew): Positioned at bottom-right
 * - Chat pill: Toggle chat panel
 * - History pill: Undo/Redo (functional)
 * - Zoom pill: ZoomIn/Out/Reset (UI only, disabled until Phase 3)
 * - Dock cannot be in the same corner as FloatingActions
 * - Auto-hides on mobile when satellite menu is open to prevent overlap
 */
export const FloatingActions: React.FC<FloatingActionsProps> = ({ isSatelliteOpen = false }) => {
  const { t, i18n } = useTranslation(['board', 'common']);
  const { handleUndo, handleRedo, isUndoAvailable, isRedoAvailable } = useBoardContext();
  const { preferences, updateCanvasPreferences } = useCanvasPreferences();
  const isRTLMode = isRTL(i18n.language);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const pillVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
    },
  };

  // Use shared mobile detection hook (device-based, not width-only)
  const isMobile = useIsMobile();

  /**
   * Wrapper to auto-blur buttons on mobile after click to remove persistent focus.
   * This prevents focus outlines from staying visible after tap on touch devices.
   * Uses setTimeout to ensure blur happens after React state updates complete.
   */
  const handleButtonClick = (callback: () => void) => (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    callback();
    
    // Auto-blur on mobile to remove focus outline after tap
    // Use setTimeout to ensure blur happens after React re-renders
    if (isMobile) {
      setTimeout(() => {
        target.blur();
      }, 0);
    }
  };

  const handleToggleChat = () => {
    void updateCanvasPreferences({ isChatOpen: !preferences.isChatOpen });
  };

  // Hide on mobile when satellite is open to prevent overlap
  const shouldHide = isSatelliteOpen && isMobile;

  if (shouldHide) {
    return null;
  }

  return (
    <motion.div
      className={`${styles.container} ${isRTLMode ? styles.rtl : styles.ltr}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Chat Toggle Pill - Visible on both Desktop and Mobile */}
      <motion.div className={styles.pill} variants={pillVariants}>
        <Button
          variant="icon"
          onClick={handleButtonClick(handleToggleChat)}
          title={preferences.isChatOpen ? t('board:workspace.hideChat') : t('board:workspace.showChat')}
          className={styles.actionButton}
          aria-pressed={preferences.isChatOpen}
        >
          <MessageSquare size={20} className={preferences.isChatOpen ? styles.activeIcon : ''} />
        </Button>
      </motion.div>

      {/* History Pill - Undo/Redo */}
      <motion.div className={styles.pill} variants={pillVariants}>
        <Button
          variant="icon"
          onClick={handleButtonClick(handleUndo)}
          disabled={!isUndoAvailable}
          title={t('board:actions.undo')}
          className={styles.actionButton}
        >
          <Undo2 size={18} />
        </Button>
        <div className={styles.pillSeparator} />
        <Button
          variant="icon"
          onClick={handleButtonClick(handleRedo)}
          disabled={!isRedoAvailable}
          title={t('board:actions.redo')}
          className={styles.actionButton}
        >
          <Redo2 size={18} />
        </Button>
      </motion.div>

      {/* Zoom Pill - Visual only, disabled until Phase 3 */}
      <motion.div className={styles.pill} variants={pillVariants}>
        <Button
          variant="icon"
          disabled
          title={t('board:zoom.comingSoon')}
          className={styles.actionButton}
        >
          <Minus size={18} />
        </Button>

        {isMobile ? (
          <div className={styles.pillSeparator} />
        ) : (
          <div className={styles.zoomIndicator} title={t('board:zoom.comingSoon')}>
            100%
          </div>
        )}

        <Button
          variant="icon"
          disabled
          title={t('board:zoom.comingSoon')}
          className={styles.actionButton}
        >
          <Plus size={18} />
        </Button>

        {!isMobile && (
          <>
            <div className={styles.pillSeparator} />
            <Button
              variant="icon"
              disabled
              title={t('board:zoom.comingSoon')}
              className={styles.actionButton}
            >
              <RotateCcw size={16} />
            </Button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default FloatingActions;
