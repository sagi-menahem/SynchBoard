import type { RegisterRequest } from 'features/settings/types/UserTypes';
import { useTranslation } from 'react-i18next';
import { useFormWithToast } from 'shared/hooks/useFormWithToast';

import * as authService from '../../services/authService';

export const useRegisterForm = (onRegistrationSuccess: (email: string) => void) => {
  const { t } = useTranslation(['auth', 'common']);

  return useFormWithToast<RegisterRequest, string>({
    validateFormData: (formData: FormData) => {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const firstName = formData.get('firstName') as string;
      const lastName = formData.get('lastName') as string;
      const gender = formData.get('gender') as 'male' | 'female';
      const phoneNumber = formData.get('phoneNumber') as string;
      const dateOfBirth = formData.get('dateOfBirth') as string;

      if (!email || !password || !firstName || !gender) {
        return { error: t('auth:registerForm.validation.required') };
      }

      return {
        email,
        password,
        firstName,
        gender,
        ...(lastName && { lastName }),
        ...(phoneNumber && { phoneNumber }),
        ...(dateOfBirth && { dateOfBirth }),
      };
    },
    serviceCall: authService.register,
    toastMessages: {
      loading: t('loading.auth.register'),
      success: (msg) => msg || t('success.auth.register'),
      error: t('errors.auth.register'),
    },
    onSuccess: (_, requestData) => {
      onRegistrationSuccess(requestData.email);
    },
    logContext: 'Registration',
  });
};
