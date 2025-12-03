/**
 * @fileoverview Authentication form hooks barrel export.
 * Exports form state management hooks for login, registration, and verification flows.
 */

export {
  authErrorHandling,
  authToastMessages,
  authValidation,
  extractFormData,
  useAuthForm,
} from './useAuthForm';

export { useForgotPasswordForm } from './useForgotPasswordForm';
export { useLoginForm } from './useLoginForm';
export { useRegisterForm } from './useRegisterForm';
export { useResendVerificationCode, useVerifyEmailForm } from './useVerifyEmailForm';
