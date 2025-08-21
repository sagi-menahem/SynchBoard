import { useActionState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import * as authService from 'services/authService';
import type { RegisterRequest } from 'types/UserTypes';

interface RegisterState {
  success: boolean;
  error?: string;
}

export const useRegisterForm = (onRegistrationSuccess: () => void) => {
  const { t } = useTranslation();

  const registerAction = async (_previousState: RegisterState, formData: FormData): Promise<RegisterState> => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phoneNumber = formData.get('phoneNumber') as string;

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return {
        success: false,
        error: t('registerForm.validation.required', 'All required fields must be filled'),
      };
    }

    const registerData: RegisterRequest = { email, password, firstName, lastName, phoneNumber };
    logger.debug('Registration form submission for user:', email);

    try {
      await authService.register(registerData);
      logger.info('Registration successful for user:', email);
      toast.success(t('registerForm.registrationSuccess'));
      onRegistrationSuccess();
      
      return {
        success: true,
      };
    } catch (err: unknown) {
      logger.error('Registration failed for user:', err, { email });
      return {
        success: false,
        error: err instanceof Error ? err.message : t('registerForm.error.unknown', 'Registration failed'),
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
