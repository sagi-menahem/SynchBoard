// Shared auth form utilities
export {
  authErrorHandling,
  authToastMessages,
  authValidation,
  extractFormData,
  useAuthForm,
} from './useAuthForm';

// Individual form hooks
export { useForgotPasswordForm } from './useForgotPasswordForm';
export { useLoginForm } from './useLoginForm';
export { useRegisterForm } from './useRegisterForm';
export { useResendVerificationCode, useVerifyEmailForm } from './useVerifyEmailForm';
