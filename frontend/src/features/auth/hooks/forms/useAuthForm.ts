import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useFormWithToast, type UseFormWithToastOptions } from 'shared/hooks/useFormWithToast';
import { validateEmail } from 'shared/utils/validationUtils';

export const authValidation = {
  validateEmail: (email: string | null, t: (key: string) => string) => {
    if (email === null || email === '') {
      toast.error(t('auth:validation.emailRequired'));
      return { error: t('auth:validation.emailRequired') };
    }
    if (!validateEmail(email)) {
      toast.error(t('auth:validation.emailInvalid'));
      return { error: t('auth:validation.emailInvalid') };
    }
    return null;
  },

  validatePassword: (password: string | null, t: (key: string) => string) => {
    if (password === null || password === '') {
      toast.error(t('auth:validation.passwordRequired'));
      return { error: t('auth:validation.passwordRequired') };
    }
    return null;
  },

  validateRequiredField: (value: string | null, fieldName: string, t: (key: string) => string) => {
    if (value === null || value === '') {
      const errorMessage = t('auth:validation.fieldRequired').replace('{{field}}', fieldName);
      toast.error(errorMessage);
      return { error: errorMessage };
    }
    return null;
  },

  validateVerificationCode: (code: string | null, t: (key: string) => string) => {
    if (code === null || code === '' || code.length !== 6) {
      toast.error(t('auth:verifyEmail.validation.codeRequired'));
      return { error: t('auth:verifyEmail.validation.codeRequired') };
    }
    if (!/^\d{6}$/.test(code)) {
      toast.error(t('auth:verifyEmail.validation.codeFormat'));
      return { error: t('auth:verifyEmail.validation.codeFormat') };
    }
    return null;
  },
};

export const authErrorHandling = {
  standardError: (t: (key: string) => string) => (err: unknown) => {
    if (err !== null && err !== undefined && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response?: { data?: { message?: string } }; message?: string };
      if (
        axiosError.response?.data?.message !== undefined &&
        axiosError.response?.data?.message !== ''
      ) {
        const message = axiosError.response.data.message;
        if (message.includes('.')) {
          const keyWithoutNamespace = message.replace('auth.', '');
          const possibleKeys = [
            `auth:errors.${keyWithoutNamespace}`,
            `auth:${keyWithoutNamespace}`,
            `auth:${message}`,
            message,
          ];

          for (const key of possibleKeys) {
            const translated = t(key);
            if (translated && translated !== key) {
              return translated;
            }
          }
        }
        return message;
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
