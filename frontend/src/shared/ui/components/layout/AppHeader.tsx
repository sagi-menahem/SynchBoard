import { useTheme } from 'features/settings/ThemeProvider';
import { useUserBoardPreferences } from 'features/settings/UserBoardPreferencesProvider';
import React, { useMemo } from 'react';
import { calculateLuminance, hexToRgbString } from 'shared/utils/ColorUtils';

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
  const { preferences } = useUserBoardPreferences();
  const { theme } = useTheme();

  // Compute header styles based on user's board appearance preference
  const headerStyles = useMemo(() => {
    const bgColor = preferences.boardBackgroundSetting;

    // Skip color customization for transparent variant
    if (variant === 'transparent') {
      return {};
    }

    // Handle CSS variables (like --board-bg-default)
    if (bgColor.startsWith('--')) {
      // For CSS variables, we need to get the computed value from the DOM
      // We'll create a temporary element to compute the color
      if (typeof window !== 'undefined') {
        const tempElement = document.createElement('div');
        tempElement.style.display = 'none';
        tempElement.style.color = `var(${bgColor})`;
        document.body.appendChild(tempElement);

        const computedColor = getComputedStyle(tempElement).color;
        document.body.removeChild(tempElement);

        // Parse RGB from computed style (format: "rgb(r, g, b)")
        const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1]);
          const g = parseInt(rgbMatch[2]);
          const b = parseInt(rgbMatch[3]);

          // Calculate luminance from RGB values
          const luminance = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
          const textColor = luminance < 0.5 ? '#ffffff' : '#000000';

          return {
            '--header-bg': `var(${bgColor})`,
            '--header-bg-rgb': `${r}, ${g}, ${b}`,
            '--header-text': textColor,
          } as React.CSSProperties;
        }
      }

      // Fallback if computation fails
      return {};
    }

    // Handle hex colors
    if (bgColor.startsWith('#')) {
      const rgbString = hexToRgbString(bgColor);
      const luminance = calculateLuminance(bgColor);

      // Determine text color based on background luminance
      const textColor = luminance < 0.5 ? '#ffffff' : '#000000';

      return {
        '--header-bg': bgColor,
        '--header-bg-rgb': rgbString,
        '--header-text': textColor,
      } as React.CSSProperties;
    }

    return {};
  }, [preferences.boardBackgroundSetting, variant, theme]);

  const headerClasses = [styles.header, styles[variant], className].filter(Boolean).join(' ');

  return (
    <header className={headerClasses} style={headerStyles}>
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
