import React from 'react';

import { Switch } from '@headlessui/react';
import { useTranslation } from 'react-i18next';

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

  // Size configurations to match ThemeSwitcher
  const sizeConfig = {
    sm: { height: 28, width: 56, fontSize: 11 },
    md: { height: 32, width: 64, fontSize: 12 },
    lg: { height: 36, width: 72, fontSize: 14 },
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
      <Switch
        checked={isHebrew}
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
          backgroundColor: isHebrew ? '#374151' : '#e5e7eb',
          padding: '0',
          transition: 'background-color 0.2s',
          outline: 'none',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
        aria-labelledby={showLabel ? 'language-label' : undefined}
        aria-label={!showLabel ? t('common:language') : undefined}
      >
        {/* Background text */}
        <div style={{
          position: 'absolute',
          inset: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '8px',
          paddingRight: '8px',
        }}>
          <span style={{
            fontSize: `${config.fontSize}px`,
            fontWeight: '700',
            color: isHebrew ? '#6b7280' : '#374151',
          }}>
            EN
          </span>
          <span style={{
            fontSize: `${config.fontSize}px`,
            fontWeight: '700',
            color: isHebrew ? '#ffffff' : '#6b7280',
          }}>
            עב
          </span>
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
            transform: isHebrew ? 'translateX(0px)' : `translateX(${config.width - config.height}px)`,
            transition: 'transform 0.2s',
          }}
        />
      </Switch>
    </div>
  );
};

export default LanguageToggle;