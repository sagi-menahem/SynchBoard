import { useContext } from 'react';

import { PreferencesContext } from 'features/settings/PreferencesContext';
import logger from 'shared/utils/logger';


export const usePreferences = () => {
  const context = useContext(PreferencesContext);

  if (context === undefined) {
    const error = new Error('usePreferences must be used within a PreferencesProvider');
    logger.error('[usePreferences] Context not found - missing PreferencesProvider wrapper');
    throw error;
  }

  return context;
};
