import { useEffect } from 'react';

import { useUserBoardPreferences } from './UserBoardPreferencesProvider';

/**
 * Component that injects user board preferences as global CSS variables.
 * This allows all components (including portaled modals) to access user preferences.
 * Must be placed inside UserBoardPreferencesProvider to access the context.
 */
export const UserPreferencesStyleInjector: React.FC = () => {
  const { preferences } = useUserBoardPreferences();

  useEffect(() => {
    // Convert board background setting to actual color value
    const getCSSColor = (cssVariable: string): string => {
      if (cssVariable.startsWith('--')) {
        // Get computed value from CSS variable
        const computedValue = getComputedStyle(document.documentElement)
          .getPropertyValue(cssVariable)
          .trim();
        return computedValue || cssVariable;
      }
      return cssVariable;
    };

    const userColor = getCSSColor(preferences.boardBackgroundSetting);

    // Inject as global CSS variable on document body
    document.body.style.setProperty('--user-chosen-color', userColor);

    // Cleanup function (though in practice this component never unmounts)
    return () => {
      document.body.style.removeProperty('--user-chosen-color');
    };
  }, [preferences.boardBackgroundSetting]);

  // This component renders nothing - it only manages CSS variables
  return null;
};
