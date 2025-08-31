import React from 'react';

import { Switch } from '@headlessui/react';
import { useTheme } from 'features/settings/ThemeProvider';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';


interface ThemeSwitcherProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ 
  className, 
  size = 'sm',
  showLabel = false,
}) => {
  const { t, i18n } = useTranslation(['common']);
  const { theme, setTheme } = useTheme();
  const isRTL = i18n.language === 'he';

  // Size configurations
  const sizeConfig = {
    sm: { height: 28, width: 56, iconSize: 14 },
    md: { height: 32, width: 64, iconSize: 16 },
    lg: { height: 36, width: 72, iconSize: 18 },
  };

  const config = sizeConfig[size];
  const isDark = theme === 'dark';

  const handleChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className={className}>
      {showLabel && (
        <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: '500', whiteSpace: 'nowrap' }} id="theme-label">
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
          border: '2px solid transparent',
          backgroundColor: isDark ? '#374151' : '#e5e7eb',
          padding: '0',
          transition: 'background-color 0.2s',
          outline: 'none',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
        aria-labelledby={showLabel ? 'theme-label' : undefined}
        aria-label={!showLabel ? t('common:theme') : undefined}
      >
        {/* Background icons */}
        <div style={{
          position: 'absolute',
          inset: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '6px',
          paddingRight: '6px',
        }}>
          <Sun size={config.iconSize} color={isDark ? '#6b7280' : '#f59e0b'} />
          <Moon size={config.iconSize} color={isDark ? '#a5b4fc' : '#6b7280'} />
        </div>
        
        {/* Handle */}
        <span
          style={{
            position: 'relative',
            display: 'inline-block',
            height: `${config.height - 4}px`,
            width: `${config.height - 4}px`,
            borderRadius: '9999px',
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            transform: isDark 
              ? (isRTL ? `translateX(-${config.width - config.height}px)` : `translateX(${config.width - config.height}px)`)
              : 'translateX(0px)',
            transition: 'transform 0.2s',
          }}
        />
      </Switch>
    </div>
  );
};

export default ThemeSwitcher;