import { useBoardContext } from 'features/board/hooks/context/useBoardContext';
import { motion } from 'framer-motion';
import { Minus, Plus, Redo2, RotateCcw, Undo2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'shared/ui';
import { isRTL } from 'shared/utils/rtlUtils';

import styles from './FloatingActions.module.scss';

/**
 * FloatingActions component - Fixed corner action buttons with RTL/LTR awareness.
 *
 * Features:
 * - LTR (English): Positioned at bottom-left
 * - RTL (Hebrew): Positioned at bottom-right
 * - History pill: Undo/Redo (functional)
 * - Zoom pill: ZoomIn/Out/Reset (UI only, disabled until Phase 3)
 * - Dock cannot be in the same corner as FloatingActions
 */
export const FloatingActions: React.FC = () => {
  const { t, i18n } = useTranslation(['board', 'common']);
  const { handleUndo, handleRedo, isUndoAvailable, isRedoAvailable } = useBoardContext();
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
      transition: { type: 'spring', stiffness: 400, damping: 25 },
    },
  };

  return (
    <motion.div
      className={`${styles.container} ${isRTLMode ? styles.rtl : styles.ltr}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* History Pill - Undo/Redo */}
      <motion.div className={styles.pill} variants={pillVariants}>
        <Button
          variant="icon"
          onClick={handleUndo}
          disabled={!isUndoAvailable}
          title={t('board:actions.undo')}
          className={styles.actionButton}
        >
          <Undo2 size={18} />
        </Button>
        <div className={styles.pillSeparator} />
        <Button
          variant="icon"
          onClick={handleRedo}
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
        <div className={styles.zoomIndicator} title={t('board:zoom.comingSoon')}>
          100%
        </div>
        <Button
          variant="icon"
          disabled
          title={t('board:zoom.comingSoon')}
          className={styles.actionButton}
        >
          <Plus size={18} />
        </Button>
        <div className={styles.pillSeparator} />
        <Button
          variant="icon"
          disabled
          title={t('board:zoom.comingSoon')}
          className={styles.actionButton}
        >
          <RotateCcw size={16} />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default FloatingActions;
