export { default as BoardAppearanceSection } from './components/BoardAppearanceSection';
export { default as ChangePasswordForm } from './components/ChangePasswordForm';
export { default as DangerZoneSection } from './components/DangerZoneSection';
export { default as LanguageSection } from './components/LanguageSection';
export { default as ProfileDetailsSection } from './components/ProfileDetailsSection';
export { default as ProfileDisplayView } from './components/ProfileDisplayView';
export { default as ProfileEditForm } from './components/ProfileEditForm';

export { useUserProfile } from './hooks/profile/useUserProfile';
export { useAccountActions } from './hooks/useAccountActions';

export { CanvasPreferencesProvider } from './CanvasPreferencesProvider';
export { ThemeProvider } from './ThemeProvider';
export { ToolPreferencesProvider } from './ToolPreferencesProvider';
export { UserBoardPreferencesProvider } from './UserBoardPreferencesProvider';

export { default as SettingsPage } from './pages/SettingsPage';

export * as UserService from './services/userService';

export type * from './types/UserTypes';
