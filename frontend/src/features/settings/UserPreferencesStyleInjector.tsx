import { useEffect } from 'react';

import { useTheme } from './ThemeProvider';
import { useUserBoardPreferences } from './UserBoardPreferencesProvider';

/**
 * Component that injects user board preferences as global CSS variables.
 * This allows all components (including portaled modals) to access user preferences.
 * Must be placed inside UserBoardPreferencesProvider to access the context.
 */
export const UserPreferencesStyleInjector: React.FC = () => {
  const { preferences } = useUserBoardPreferences();
  const { theme } = useTheme();

  useEffect(() => {
    // Instead of resolving the CSS variable to a concrete color value,
    // inject the CSS variable reference directly. This allows the browser
    // to resolve it based on the current theme automatically.
    const userColorValue = preferences.boardBackgroundSetting.startsWith('--')
      ? `var(${preferences.boardBackgroundSetting})`
      : preferences.boardBackgroundSetting;

    // Inject as global CSS variable on document body
    document.body.style.setProperty('--user-chosen-color', userColorValue);

    // Cleanup function (though in practice this component never unmounts)
    return () => {
      document.body.style.removeProperty('--user-chosen-color');
    };
  }, [preferences.boardBackgroundSetting, theme]);

  // This component renders nothing - it only manages CSS variables
  return null;
};
