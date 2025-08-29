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
      const genderValue = formData.get('gender');
      const gender = genderValue as 'male' | 'female';
      const phoneNumber = formData.get('phoneNumber') as string;
      const dateOfBirth = formData.get('dateOfBirth') as string;

      if (email === null || email === '' || password === null || password === '' || firstName === null || firstName === '' || genderValue === null || genderValue === '') {
        return { error: t('auth:registerForm.validation.required') };
      }

      return {
        email,
        password,
        firstName,
        gender,
        ...(lastName !== null && lastName !== '' && { lastName }),
        ...(phoneNumber !== null && phoneNumber !== '' && { phoneNumber }),
        ...(dateOfBirth !== null && dateOfBirth !== '' && { dateOfBirth }),
      };
    },
    serviceCall: authService.register,
    toastMessages: {
      loading: t('auth:loading.register'),
      success: (msg) => (typeof msg === 'string' ? msg : t('auth:success.register')),
      error: t('auth:errors.register'),
    },
    onSuccess: (_, requestData) => {
      onRegistrationSuccess(requestData.email);
    },
    logContext: 'Registration',
  });
};
