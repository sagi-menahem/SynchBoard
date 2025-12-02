import { useLanguageSync } from 'features/settings/hooks';
import React from 'react';

import { useTranslation } from 'react-i18next';
import LanguageToggle from 'shared/ui/components/forms/LanguageToggle';

/**
 * Props for the GuestLanguageSwitcher component defining display and interaction options.
 */
interface GuestLanguageSwitcherProps {
  /** Optional CSS class name for custom styling */
  className?: string;
  /** Size variant for the language toggle component */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to display language labels alongside icons */
  showLabel?: boolean;
}

/**
 * Language switcher component specifically designed for guest (unauthenticated) users.
 * Provides language selection interface that persists preferences in localStorage rather than server storage.
 * Integrates with the language sync system to handle guest-specific language management without authentication.
 * Uses the shared LanguageToggle component with appropriate sizing and labeling options for different contexts.
 *
 * @param className - Optional CSS class for custom styling
 * @param size - Size variant for the toggle component (defaults to 'sm')
 * @param showLabel - Whether to show language labels (defaults to false)
 */
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
