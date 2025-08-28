// Settings Feature Barrel Exports

// Components
export { default as ProfileDetailsSection } from './components/ProfileDetailsSection';
export { default as ChangePasswordForm } from './components/ChangePasswordForm';
export { default as BoardAppearanceSection } from './components/BoardAppearanceSection';
export { default as LanguageSection } from './components/LanguageSection';
export { default as DangerZoneSection } from './components/DangerZoneSection';
export { default as ProfileDisplayView } from './components/ProfileDisplayView';
export { default as ProfileEditForm } from './components/ProfileEditForm';

// Hooks
export { useAccountManager } from './hooks/useAccountManager';
export { usePasswordManager } from './hooks/usePasswordManager';
export { useUserProfile } from './hooks/profile/useUserProfile';

// Context
export { PreferencesProvider } from './PreferencesProvider';
export { PreferencesContext } from './PreferencesContext';

// Pages
export { default as SettingsPage } from './pages/SettingsPage';

// Services
export * as UserService from './services/userService';

// Types - Re-export for convenience
export type * from './types/UserTypes';