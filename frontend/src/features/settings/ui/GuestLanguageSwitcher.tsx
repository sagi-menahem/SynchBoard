import React from 'react';

import { useLanguageSync } from 'features/settings/hooks';
import { useTranslation } from 'react-i18next';
import LanguageToggle from 'shared/ui/components/forms/LanguageToggle';

interface GuestLanguageSwitcherProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const GuestLanguageSwitcher: React.FC<GuestLanguageSwitcherProps> = ({
  className,
  size = 'sm',
  showLabel = false,
}) => {
  const { i18n } = useTranslation(['common']);
  const { setGuestLanguage } = useLanguageSync();

  const currentLanguage = i18n.language as 'en' | 'he';

  return (
    <LanguageToggle
      value={currentLanguage}
      onChange={setGuestLanguage}
      className={className}
      size={size}
      showLabel={showLabel}
    />
  );
};

export default GuestLanguageSwitcher;
