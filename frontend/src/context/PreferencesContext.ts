import { createContext } from 'react';

import type { UserPreferences } from 'types/user.types';

export interface PreferencesContextType {
    preferences: UserPreferences;
    updatePreferences: (newPrefs: UserPreferences) => Promise<void>;
}

export const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);
