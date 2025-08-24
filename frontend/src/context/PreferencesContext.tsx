import React, { createContext, useContext, type ReactNode } from 'react';

import type { UserPreferences } from 'types/UserTypes';

interface PreferencesContextType {
    preferences: UserPreferences;
    updatePreferences: (newPrefs: UserPreferences) => Promise<void>;
}

export const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const usePreferences = (): PreferencesContextType => {
    const context = useContext(PreferencesContext);
    if (context === undefined) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
};