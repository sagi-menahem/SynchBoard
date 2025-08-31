import React from 'react';

import { useTheme } from 'features/settings/ThemeProvider';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ReactSwitch from 'react-switch';


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
  const { t } = useTranslation(['common']);
  const { theme, setTheme } = useTheme();

  // Size configurations
  const sizeConfig = {
    sm: { height: 24, width: 48, handleDiameter: 20, iconSize: 12 },
    md: { height: 28, width: 56, handleDiameter: 24, iconSize: 14 },
    lg: { height: 32, width: 64, handleDiameter: 28, iconSize: 16 },
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
      <ReactSwitch
        checked={isDark}
        onChange={handleChange}
        onColor="#374151"         // Dark theme - dark gray background
        offColor="#e5e7eb"        // Light theme - light gray background  
        onHandleColor="rgba(255, 255, 255, 0.3)"   // Very transparent white handle
        offHandleColor="rgba(55, 65, 81, 0.3)"     // Very transparent dark handle
        handleDiameter={config.handleDiameter}
        uncheckedIcon={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
            <Sun size={config.iconSize} color="#f59e0b" />
          </div>
        }
        checkedIcon={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
            <Moon size={config.iconSize} color="#a5b4fc" />
          </div>
        }
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.2)"
        activeBoxShadow="0 2px 6px rgba(0, 0, 0, 0.3)"
        height={config.height}
        width={config.width}
        id="theme-switch"
        aria-labelledby={showLabel ? 'theme-label' : undefined}
        aria-label={!showLabel ? t('common:theme') : undefined}
      />
    </div>
  );
};

export default ThemeSwitcher;