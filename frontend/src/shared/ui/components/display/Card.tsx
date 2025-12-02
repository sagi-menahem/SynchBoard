import { motion } from 'framer-motion';
import React, { useMemo } from 'react';

import styles from './Card.module.scss';

// Animation variants for card entrance
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: 'easeOut' as const,
    },
  },
};

interface CardProps {
  /** Content to be displayed within the card container */
  children: React.ReactNode;
  /** Visual style variant determining shadow and border appearance */
  variant?: 'default' | 'elevated' | 'outlined' | 'empty-state' | 'glass';
  /** Internal spacing size for consistent content positioning */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Whether card should respond to hover interactions with visual feedback */
  hoverable?: boolean;
  /** Whether to animate the card on mount with a fade-in effect */
  animate?: boolean;
  /** Additional CSS classes for custom styling */
  className?: string;
  /** Click handler for interactive cards */
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Title attribute for tooltip */
  title?: string;
}

/**
 * Flexible container component providing consistent visual grouping and spacing.
 * Serves as a foundation for displaying related content with appropriate visual hierarchy
 * through different shadow depths, borders, and interactive states.
 *
 * @param children - Content to be displayed within the card container
 * @param variant - Visual style variant:
 *   - 'default': Use for standard content grouping with subtle shadow and background
 *   - 'elevated': Use for modal content, floating elements, or components requiring visual emphasis
 *   - 'outlined': Use when subtle background contrast is needed or borders are preferred over shadows
 *   - 'empty-state': Use for placeholder content when no data is available to display
 * @param padding - Internal spacing size:
 *   - 'none': Use when child components handle their own spacing and layout
 *   - 'sm': Use for compact content, lists, or minimal information display
 *   - 'md': Use for standard content sections and general-purpose containers
 *   - 'lg': Use for primary content areas, hero sections, or prominent information displays
 * @param hoverable - Whether card should respond to hover interactions with visual feedback
 * @param animate - Whether to animate the card on mount with a fade-in effect
 * @param className - Additional CSS classes for custom styling
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      variant = 'default',
      padding = 'md',
      hoverable = false,
      animate = false,
      onClick,
      style,
      title,
    },
    ref,
  ) => {
    const cardClasses = useMemo(
      () =>
        [
          variant !== 'glass' && styles.card, // Don't apply card-base to glass variant
          styles[variant],
          styles[`padding-${padding}`],
          hoverable && styles.hoverable,
          className,
        ]
          .filter(Boolean)
          .join(' '),
      [variant, padding, hoverable, className],
    );

    if (animate) {
      return (
        <motion.div
          ref={ref}
          className={cardClasses}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          onClick={onClick}
          style={style}
          title={title}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={cardClasses} onClick={onClick} style={style} title={title}>
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

export default Card;
