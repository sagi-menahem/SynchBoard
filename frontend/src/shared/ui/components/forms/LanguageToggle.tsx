import React from 'react';
import { useTranslation } from 'react-i18next';

import Switch from './Switch';

/**
 * Props for the LanguageToggle component.
 */
interface LanguageToggleProps {
  value: 'en' | 'he'; // Currently selected language
  onChange: (language: 'en' | 'he') => void; // Callback when language changes
  className?: string;
  size?: 'sm' | 'md' | 'lg'; // Visual size of the toggle
  showLabel?: boolean; // Whether to display language label
}

/**
 * Language toggle switch component for switching between English and Hebrew.
 * Provides a visual toggle interface with proper RTL support and accessibility features.
 * Uses Headless UI Switch for keyboard navigation and screen reader compatibility.
 *
 * @param {'en' | 'he'} value - Currently selected language code
 * @param {function} onChange - Callback function called when language selection changes
 * @param {string} className - Optional CSS class to apply to the toggle container
 * @param {'sm' | 'md' | 'lg'} size - Visual size variant for the toggle switch
 * @param {boolean} showLabel - Whether to display the language label alongside the toggle
 */
const LanguageToggle: React.FC<LanguageToggleProps> = ({
  value,
  onChange,
  className,
  size = 'sm',
  showLabel = false,
}) => {
  const { t, i18n } = useTranslation(['common']);
  const isRTL = i18n.language === 'he';

  // Size configuration for different toggle variants
  // Font sizes meet WCAG AA minimum of 12px for adequate contrast
  const sizeConfig = {
    sm: { height: 28, width: 56, fontSize: 12, activeFontSize: 10 },
    md: { height: 32, width: 64, fontSize: 12, activeFontSize: 11 },
    lg: { height: 36, width: 72, fontSize: 14, activeFontSize: 12 },
  };

  const config = sizeConfig[size];
  const isHebrew = value === 'he';

  // Convert boolean switch state to language code
  const handleChange = (checked: boolean) => {
    onChange(checked ? 'he' : 'en');
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
          id="language-label"
        >
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
          border: '1px solid rgba(120, 120, 128, 0.3)',
          backgroundColor: 'rgba(120, 120, 128, 0.12)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '0',
          transition: 'all 0.2s ease',
          outline: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        }}
        aria-labelledby={showLabel ? 'language-label' : undefined}
        aria-label={!showLabel ? t('common:language') : undefined}
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
            backgroundColor: '#2563eb',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)',
            transform: isHebrew
              ? `translateX(${isRTL ? '-' : ''}${config.width - config.height}px)`
              : 'translateX(0px)',
            transition: 'all 0.2s ease',
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontSize: `${config.activeFontSize}px`,
              fontWeight: '700',
              color: '#ffffff',
            }}
          >
            {isHebrew ? 'HE' : 'EN'}
          </span>
        </span>

        <div
          style={{
            position: 'absolute',
            inset: '2px',
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: `${config.fontSize}px`,
                fontWeight: '600',
                color: 'var(--color-text-secondary)',
                opacity: isHebrew ? 1 : 0,
              }}
            >
              EN
            </span>
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: `${config.fontSize}px`,
                fontWeight: '600',
                color: 'var(--color-text-secondary)',
                opacity: isHebrew ? 0 : 1,
              }}
            >
              HE
            </span>
          </div>
        </div>
      </Switch>
    </div>
  );
};

export default LanguageToggle;
