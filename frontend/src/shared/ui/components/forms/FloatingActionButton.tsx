import clsx from 'clsx';
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
  /** Whether the button is hidden (uses CSS for smooth animation) */
  hidden?: boolean;
}

/**
 * Floating Action Button (FAB) component for mobile interfaces.
 * Provides a prominent button for primary actions with optional badge support.
 * Uses CSS transitions instead of framer-motion to avoid animation glitches
 * when the button re-renders after drawer close.
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
  hidden = false,
}) => {
  return (
    <button
      type="button"
      className={clsx(styles.fab, styles[position], hidden && styles.hidden, className)}
      onClick={onClick}
      disabled={disabled || hidden}
      aria-label={ariaLabel}
      aria-hidden={hidden}
    >
      <Icon size={24} />
      {badge !== undefined && badge > 0 && (
        <span className={styles.badge}>{badge > 99 ? '99+' : badge}</span>
      )}
    </button>
  );
};

export default FloatingActionButton;
