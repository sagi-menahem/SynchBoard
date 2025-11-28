import clsx from 'clsx';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import React from 'react';

import styles from './FloatingActionButton.module.scss';

/**
 * Props for the FloatingActionButton component.
 */
interface FloatingActionButtonProps {
  /** Icon component to display */
  icon: LucideIcon;
  /** Click handler */
  onClick: () => void;
  /** Accessible label for the button */
  'aria-label': string;
  /** Optional badge count to display */
  badge?: number;
  /** Position of the FAB */
  position?: 'bottom-left' | 'bottom-right';
  /** Additional CSS classes */
  className?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
}

/**
 * Floating Action Button (FAB) component for mobile interfaces.
 * Provides a prominent, animated button for primary actions with optional badge support.
 *
 * @param icon - Lucide icon component to render
 * @param onClick - Click event handler
 * @param aria-label - Accessibility label
 * @param badge - Optional notification badge count
 * @param position - Screen position (default: bottom-right)
 * @param className - Additional CSS classes
 * @param disabled - Disabled state
 */
const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon: Icon,
  onClick,
  'aria-label': ariaLabel,
  badge,
  position = 'bottom-right',
  className,
  disabled = false,
}) => {
  return (
    <motion.button
      type="button"
      className={clsx(styles.fab, styles[position], className)}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Icon size={24} />
      {badge !== undefined && badge > 0 && (
        <span className={styles.badge}>{badge > 99 ? '99+' : badge}</span>
      )}
    </motion.button>
  );
};

export default FloatingActionButton;
