// File: frontend/src/hooks/preferences/usePreferences.ts
import { PreferencesContext } from 'context/PreferencesContext';
import { useContext } from 'react';

export const usePreferences = () => {
    const context = useContext(PreferencesContext);

    if (context === undefined) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }

    return context;
};
