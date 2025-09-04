import React from 'react';

import styles from './Card.module.scss';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'empty-state';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

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
