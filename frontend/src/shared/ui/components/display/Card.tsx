import React from 'react';

import styles from './Card.module.scss';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Content to be displayed within the card container */
  children: React.ReactNode;
  /** Visual style variant determining shadow and border appearance */
  variant?: 'default' | 'elevated' | 'outlined' | 'empty-state';
  /** Internal spacing size for consistent content positioning */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Whether card should respond to hover interactions with visual feedback */
  hoverable?: boolean;
}

/**
 * Flexible container component providing consistent visual grouping and spacing.
 * Serves as a foundation for displaying related content with appropriate visual hierarchy
 * through different shadow depths, borders, and interactive states.
 *
 * @param children - Content to be displayed within the card container
 * @param variant - Visual style variant determining shadow and border appearance
 * @param padding - Internal spacing size for consistent content positioning  
 * @param hoverable - Whether card should respond to hover interactions with visual feedback
 * @param className - Additional CSS classes for custom styling
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { children, className, variant = 'default', padding = 'md', hoverable = false, ...props },
    ref,
  ) => {
    const cardClasses = [
      styles.card,
      styles[variant],
      styles[`padding-${padding}`],
      hoverable && styles.hoverable,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

export default Card;
