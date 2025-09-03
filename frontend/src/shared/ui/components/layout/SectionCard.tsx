import React from 'react';

import styles from './SectionCard.module.scss';

interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'danger' | 'warning' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  showHeader?: boolean;
  headerActions?: React.ReactNode;
  className?: string;
}

const SectionCard = React.forwardRef<HTMLDivElement, SectionCardProps>(
  ({ 
    children, 
    title,
    subtitle,
    variant = 'default', 
    padding = 'md', 
    showHeader = true,
    headerActions,
    className,
    ...props 
  }, ref) => {
    const cardClasses = [
      styles.sectionCard,
      styles[variant],
      className,
    ].filter(Boolean).join(' ');

    const contentWrapperClasses = [
      styles.contentWrapper,
      styles[`padding-${padding}`],
    ].filter(Boolean).join(' ');

    const shouldShowHeader = showHeader && (title ?? headerActions);

    return (
      <section ref={ref} className={cardClasses} {...props}>
        {shouldShowHeader && (
          <header className={styles.header}>
            <div className={styles.headerContent}>
              {title && (
                <div className={styles.titleGroup}>
                  <h2 className={styles.title}>{title}</h2>
                  {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
              )}
              {headerActions && (
                <div className={styles.headerActions}>
                  {headerActions}
                </div>
              )}
            </div>
          </header>
        )}
        <div className={contentWrapperClasses}>
          <div className={styles.content}>
            {children}
          </div>
        </div>
      </section>
    );
  },
);

SectionCard.displayName = 'SectionCard';

export default SectionCard;