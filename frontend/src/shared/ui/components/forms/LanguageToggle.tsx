import React from 'react';

import { useTranslation } from 'react-i18next';
import ReactSwitch from 'react-switch';

interface LanguageToggleProps {
  value: 'en' | 'he';
  onChange: (language: 'en' | 'he') => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
  value,
  onChange,
  className, 
  size = 'sm',
  showLabel = false,
}) => {
  const { t } = useTranslation(['common']);

  // Size configurations - smaller handles to show content
  const sizeConfig = {
    sm: { height: 24, width: 48, handleDiameter: 16, fontSize: 10 },
    md: { height: 28, width: 56, handleDiameter: 20, fontSize: 11 },
    lg: { height: 32, width: 64, handleDiameter: 24, fontSize: 12 },
  };

  const config = sizeConfig[size];
  const isHebrew = value === 'he';

  const handleChange = (checked: boolean) => {
    onChange(checked ? 'he' : 'en');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className={className}>
      {showLabel && (
        <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: '500', whiteSpace: 'nowrap' }} id="language-label">
          {t('common:language')}
        </span>
      )}
      <ReactSwitch
        checked={isHebrew}
        onChange={handleChange}
        onColor="#374151"         // Same elegant dark gray as ThemeSwitcher
        offColor="#374151"        // Same elegant light gray as ThemeSwitcher  
        onHandleColor="rgba(255, 255, 255, 0.3)"   // Very transparent white handle
        offHandleColor="rgba(55, 65, 81, 0.3)"     // Very transparent dark handle
        handleDiameter={config.handleDiameter}
        uncheckedIcon={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%', 
            width: '100%',
            fontSize: `${config.fontSize}px`,
            fontWeight: '700',
            color: '#a5b4fc',
          }}>
            EN
          </div>
        }
        checkedIcon={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%', 
            width: '100%',
            fontSize: `${config.fontSize}px`,
            fontWeight: '700',
            color: '#a5b4fc',
          }}>
            עב
          </div>
        }
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.2)"
        activeBoxShadow="0 2px 6px rgba(0, 0, 0, 0.3)"
        height={config.height}
        width={config.width}
        id="language-switch"
        aria-labelledby={showLabel ? 'language-label' : undefined}
        aria-label={!showLabel ? t('common:language') : undefined}
      />
    </div>
  );
};

export default LanguageToggle;