import { Switch } from '@headlessui/react';
import { useTheme } from 'features/settings/ThemeProvider';
import { Moon, Sun } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Props for the ThemeSwitcher component.
 */
interface ThemeSwitcherProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg'; // Visual size of the switch
  showLabel?: boolean; // Whether to display theme label
}

/**
 * Theme toggle switch component for switching between light and dark modes.
 * Provides a visual toggle interface with sun/moon icons and proper RTL support.
 * Uses Headless UI Switch for keyboard navigation and accessibility.
 *
 * @param {string} className - Optional CSS class to apply to the container
 * @param {'sm' | 'md' | 'lg'} size - Visual size variant:
 *   - 'sm': Use in compact toolbars, mobile interfaces, or space-constrained areas
 *   - 'md': Use in standard form controls and general settings panels
 *   - 'lg': Use in onboarding flows, user preferences, or prominent UI sections
 * @param {boolean} showLabel - Whether to display theme name label:
 *   - true: Use in settings pages where context and clarity are important
 *   - false: Use in compact toolbars or headers where space is limited
 */
const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className,
  size = 'sm',
  showLabel = false,
}) => {
  const { t, i18n } = useTranslation(['common']);
  const { theme, setTheme } = useTheme();
  const isRTL = i18n.language === 'he';

  // Size configuration for different switch variants
  const sizeConfig = {
    sm: { height: 28, width: 56, iconSize: 14 },
    md: { height: 32, width: 64, iconSize: 16 },
    lg: { height: 36, width: 72, iconSize: 18 },
  };

  const config = sizeConfig[size];
  const isDark = theme === 'dark';

  // Convert boolean switch state to theme string
  const handleChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className={className}>
      {showLabel && (
        <span
          style={{
            fontSize: '14px',
            color: 'var(--color-text-muted)',
            fontWeight: '500',
            whiteSpace: 'nowrap',
          }}
          id="theme-label"
        >
          {t('common:theme')}
        </span>
      )}
      <Switch
        checked={isDark}
        onChange={handleChange}
        style={{
          position: 'relative',
          display: 'inline-flex',
          height: `${config.height}px`,
          width: `${config.width}px`,
          flexShrink: 0,
          cursor: 'pointer',
          borderRadius: '9999px',
          border: '1px solid rgba(120, 120, 128, 0.3)',
          backgroundColor: 'rgba(120, 120, 128, 0.12)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '0',
          transition: 'all 0.2s ease',
          outline: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        }}
        aria-labelledby={showLabel ? 'theme-label' : undefined}
        aria-label={!showLabel ? t('common:theme') : undefined}
      >
        <span
          style={{
            position: 'absolute',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: `${config.height - 6}px`,
            width: `${config.height - 6}px`,
            top: '2px',
            insetInlineStart: '2px',
            borderRadius: '9999px',
            backgroundColor: isDark ? 'rgba(96, 165, 250, 0.9)' : 'rgba(251, 191, 36, 0.9)',
            boxShadow: isDark
              ? '0 2px 8px rgba(96, 165, 250, 0.4)'
              : '0 2px 8px rgba(251, 191, 36, 0.4)',
            transform: isDark
              ? `translateX(${isRTL ? '-' : ''}${config.width - config.height}px)`
              : 'translateX(0px)',
            transition: 'all 0.2s ease',
            zIndex: 2,
          }}
        >
          {isDark ? (
            <Moon size={config.iconSize - 4} color="white" />
          ) : (
            <Sun size={config.iconSize - 4} color="white" />
          )}
        </span>

        <div
          style={{
            position: 'absolute',
            inset: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: '6px',
            paddingRight: '6px',
            zIndex: 1,
          }}
        >
          <Sun
            size={config.iconSize}
            color={isDark ? 'var(--color-text-muted)' : 'transparent'}
            style={{ opacity: isDark ? 0.5 : 0 }}
          />
          <Moon
            size={config.iconSize}
            color={isDark ? 'transparent' : 'var(--color-text-muted)'}
            style={{ opacity: isDark ? 0 : 0.5 }}
          />
        </div>
      </Switch>
    </div>
  );
};

export default ThemeSwitcher;
