// Auth Feature Barrel Exports

// Components
export { default as LoginForm } from './components/LoginForm';
export { default as RegistrationForm } from './components/RegistrationForm';
export { default as GoogleLoginButton } from './components/GoogleLoginButton';
export { default as ForgotPasswordModal } from './components/ForgotPasswordModal';
export { default as EmailVerificationModal } from './components/EmailVerificationModal';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useOAuthCallback } from './hooks/useOAuthCallback';
export { useLoginForm } from './hooks/forms/useLoginForm';
export { useRegisterForm } from './hooks/forms/useRegisterForm';
export { useForgotPasswordForm } from './hooks/forms/useForgotPasswordForm';
export { useVerifyEmailForm } from './hooks/forms/useVerifyEmailForm';

// Context
export { AuthProvider } from './AuthProvider';
export { AuthContext } from './AuthContext';

// Pages
export { default as AuthPage } from './pages/AuthPage';

// Services
export * as AuthService from './services/authService';

// Utils
export * from './utils/SecurityUtils';