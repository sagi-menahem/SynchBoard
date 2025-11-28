import React from 'react';

import styles from './AppHeader.module.scss';

/**
 * Visual variants for the AppHeader component.
 */
type AppHeaderVariant = 'default' | 'transparent' | 'elevated';

/**
 * Props interface for the AppHeader component.
 * Uses composition pattern with slots for flexible content placement.
 */
interface AppHeaderProps {
  /** Content for the leading (start) section - typically navigation */
  leading?: React.ReactNode;
  /** Primary title or branding area */
  title?: React.ReactNode;
  /** Content for the trailing (end) section - typically actions */
  trailing?: React.ReactNode;
  /** Optional center content (search, tabs, etc.) - hidden on mobile by default */
  center?: React.ReactNode;
  /** Visual variant affecting background/border treatment */
  variant?: AppHeaderVariant;
  /** Whether center content should be visible on mobile */
  showCenterOnMobile?: boolean;
  /** Additional className for customization */
  className?: string;
}

/**
 * Generic header shell component using composition pattern with slots.
 * Designed to be reusable across different pages while supporting the board's needs.
 * Features glass-morphism effect and responsive layout with RTL support.
 *
 * @param leading - Content for the start section (typically back button)
 * @param title - Primary title content
 * @param trailing - Content for the end section (typically action buttons)
 * @param center - Optional center content (hidden on mobile by default)
 * @param variant - Visual variant: 'default', 'transparent', or 'elevated'
 * @param showCenterOnMobile - Whether to show center content on mobile
 * @param className - Additional CSS classes
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  leading,
  title,
  trailing,
  center,
  variant = 'default',
  showCenterOnMobile = false,
  className,
}) => {
  const headerClasses = [styles.header, styles[variant], className].filter(Boolean).join(' ');

  return (
    <header className={headerClasses}>
      <div className={styles.leading}>
        {leading}
        {title && <div className={styles.title}>{title}</div>}
      </div>

      {center && (
        <div className={styles.center} data-show-mobile={showCenterOnMobile}>
          {center}
        </div>
      )}

      <div className={styles.trailing}>{trailing}</div>
    </header>
  );
};

export default AppHeader;
