import { createContext } from 'react';

import type { UserPreferences } from 'features/settings/types/UserTypes';

export interface PreferencesContextType {
    preferences: UserPreferences;
    updatePreferences: (newPrefs: UserPreferences) => Promise<void>;
    updatePreferencesSilent: (newPrefs: UserPreferences) => Promise<void>;
}

export const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);
