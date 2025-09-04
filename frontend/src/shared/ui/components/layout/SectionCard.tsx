import React from 'react';

import styles from './SectionCard.module.scss';

/**
 * Props for the SectionCard component.
 * Extends standard HTML div attributes for flexible usage.
 */
interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode; // Content to display within the card
  title?: string; // Main title for the card header
  subtitle?: string; // Secondary descriptive text below title
  variant?: 'default' | 'danger' | 'warning' | 'elevated'; // Visual styling variant
  padding?: 'none' | 'sm' | 'md' | 'lg'; // Content padding size
  showHeader?: boolean; // Whether to display the header section
  headerActions?: React.ReactNode; // Action buttons or content for header
  className?: string;
}

/**
 * Versatile section card component for organizing content with optional header and various styling variants.
 * Provides consistent layout structure with responsive design and accessibility features.
 * Supports different visual states (default, warning, danger, elevated) and flexible content padding.
 * 
 * @param {React.ReactNode} children - Content to display within the card body
 * @param {string} title - Main title text for the card header
 * @param {string} subtitle - Secondary descriptive text displayed below the title
 * @param {'default' | 'danger' | 'warning' | 'elevated'} variant - Visual styling variant for different contexts
 * @param {'none' | 'sm' | 'md' | 'lg'} padding - Content padding size for internal spacing
 * @param {boolean} showHeader - Whether to display the header section with title and actions
 * @param {React.ReactNode} headerActions - Action buttons or additional content for the header area
 * @param {string} className - Optional CSS class to apply to the card container
 */
const SectionCard = React.forwardRef<HTMLDivElement, SectionCardProps>(
  (
    {
      children,
      title,
      subtitle,
      variant = 'default',
      padding = 'md',
      showHeader = true,
      headerActions,
      className,
      ...props
    },
    ref,
  ) => {
    const cardClasses = [styles.sectionCard, styles[variant], className].filter(Boolean).join(' ');

    const contentWrapperClasses = [styles.contentWrapper, styles[`padding-${padding}`]]
      .filter(Boolean)
      .join(' ');

    // Only show header if explicitly enabled and has title or actions
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
              {headerActions && <div className={styles.headerActions}>{headerActions}</div>}
            </div>
          </header>
        )}
        <div className={contentWrapperClasses}>
          <div className={styles.content}>{children}</div>
        </div>
      </section>
    );
  },
);

SectionCard.displayName = 'SectionCard';

export default SectionCard;
