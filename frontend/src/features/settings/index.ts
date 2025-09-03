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
export { useAccountActions } from './hooks/useAccountActions';
export { useUserProfile } from './hooks/profile/useUserProfile';

// Providers
export { ThemeProvider } from './ThemeProvider';
export { ToolPreferencesProvider } from './ToolPreferencesProvider';
export { CanvasPreferencesProvider } from './CanvasPreferencesProvider';
export { UserBoardPreferencesProvider } from './UserBoardPreferencesProvider';

// Pages
export { default as SettingsPage } from './pages/SettingsPage';

// Services
export * as UserService from './services/userService';

// Types - Re-export for convenience
export type * from './types/UserTypes';