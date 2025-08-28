import { useActionState } from 'react';

import type { RegisterRequest } from 'features/settings/types/UserTypes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'shared/utils/logger';

import * as authService from '../../services/authService';

interface RegisterState {
  success: boolean;
  error?: string;
}

export const useRegisterForm = (onRegistrationSuccess: (email: string) => void) => {
  const { t } = useTranslation(['auth', 'common']);

  const registerAction = async (_previousState: RegisterState, formData: FormData): Promise<RegisterState> => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const gender = formData.get('gender') as 'male' | 'female';
    const phoneNumber = formData.get('phoneNumber') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;

    if (!email || !password || !firstName || !gender) {
      return {
        success: false,
        error: t('auth:registerForm.validation.required'),
      };
    }

    const registerData: RegisterRequest = {
      email,
      password,
      firstName,
      gender,
      ...(lastName && { lastName }),
      ...(phoneNumber && { phoneNumber }),
      ...(dateOfBirth && { dateOfBirth }),
    };

    try {
      await toast.promise(
        authService.register(registerData),
        {
          loading: t('loading.auth.register'),
          success: (msg) => msg || t('success.auth.register'),
          error: t('errors.auth.register'),
        },
      );
      onRegistrationSuccess(email);

      return {
        success: true,
      };
    } catch (err: unknown) {
      logger.error('Registration failed for user:', err, { email });
      return {
        success: false,
      };
    }
  };

  const [state, submitAction, isPending] = useActionState(registerAction, {
    success: false,
  });

  return {
    state,
    submitAction,
    isPending,
  };
};
