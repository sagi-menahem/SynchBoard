import { useTranslation } from 'react-i18next';
import { useFormWithToast, type UseFormWithToastOptions } from 'shared/hooks/useFormWithToast';
import { validateEmail } from 'shared/utils/validationUtils';

// Common validation utilities for auth forms
export const authValidation = {
  validateEmail: (email: string | null, t: (key: string) => string) => {
    if (email === null || email === '') {
      return { error: t('auth:validation.emailRequired') };
    }
    if (!validateEmail(email)) {
      return { error: t('auth:validation.emailInvalid') };
    }
    return null;
  },

  validatePassword: (password: string | null, t: (key: string) => string) => {
    if (password === null || password === '') {
      return { error: t('auth:validation.passwordRequired') };
    }
    return null;
  },

  validateRequiredField: (value: string | null, fieldName: string, t: (key: string) => string) => {
    if (value === null || value === '') {
      return { error: t('auth:validation.fieldRequired').replace('{{field}}', fieldName) };
    }
    return null;
  },

  validateVerificationCode: (code: string | null, t: (key: string) => string) => {
    if (code === null || code === '' || code.length !== 6) {
      return { error: t('auth:verifyEmail.validation.codeRequired') };
    }
    if (!/^\d{6}$/.test(code)) {
      return { error: t('auth:verifyEmail.validation.codeFormat') };
    }
    return null;
  },
};

// Common error handling for auth responses
export const authErrorHandling = {
  standardError: (t: (key: string) => string) => (err: unknown) => {
    if (err !== null && err !== undefined && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response?: { data?: { message?: string } }; message?: string };
      if (axiosError.response?.data?.message !== undefined && axiosError.response?.data?.message !== '') {
        return axiosError.response.data.message;
      }
      if (axiosError.message !== undefined && axiosError.message !== '') {
        return axiosError.message;
      }
    }
    return t('auth:errors.unknown');
  },

  dynamicMessageHandler: (successKey: string, t: (key: string) => string) => (msg: unknown) =>
    typeof msg === 'string' ? msg : t(successKey),
};

// Common toast message configurations
export const authToastMessages = {
  login: (t: (key: string) => string) => ({
    loading: t('auth:loading.login'),
    success: t('auth:success.login'),
    error: authErrorHandling.standardError(t),
  }),

  register: (t: (key: string) => string) => ({
    loading: t('auth:loading.register'),
    success: authErrorHandling.dynamicMessageHandler('auth:success.register', t),
    error: t('auth:errors.register'),
  }),

  forgotPassword: (t: (key: string) => string) => ({
    loading: t('auth:loading.forgotPassword'),
    success: authErrorHandling.dynamicMessageHandler('auth:success.forgotPassword', t),
    error: t('auth:errors.forgotPassword'),
  }),

  verifyEmail: (t: (key: string) => string) => ({
    loading: t('auth:loading.verifyEmail'),
    success: t('auth:success.verifyEmail'),
    error: t('auth:errors.verifyEmail'),
  }),
};

// Base auth form hook that provides common functionality
export const useAuthForm = <TRequest extends object, TResponse>(
  options: Omit<UseFormWithToastOptions<TRequest, TResponse>, 'toastMessages'> & {
    formType: 'login' | 'register' | 'forgotPassword' | 'verifyEmail';
  },
) => {
  const { t } = useTranslation(['auth', 'common']);
  const { formType, ...restOptions } = options;

  const toastMessages = authToastMessages[formType](t);

  return useFormWithToast<TRequest, TResponse>({
    ...restOptions,
    toastMessages,
  });
};

// Form data extraction utilities
export const extractFormData = {
  email: (formData: FormData) => formData.get('email') as string,
  password: (formData: FormData) => formData.get('password') as string,
  firstName: (formData: FormData) => formData.get('firstName') as string,
  lastName: (formData: FormData) => formData.get('lastName') as string,
  gender: (formData: FormData) => formData.get('gender') as 'male' | 'female',
  phoneNumber: (formData: FormData) => formData.get('phoneNumber') as string,
  dateOfBirth: (formData: FormData) => formData.get('dateOfBirth') as string,
  verificationCode: (formData: FormData) => formData.get('verificationCode') as string,
};