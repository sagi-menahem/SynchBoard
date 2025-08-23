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

export const useRegisterForm = (onRegistrationSuccess: (email: string) => void) => {
  const { t } = useTranslation();

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
        error: t('registerForm.validation.required', 'All required fields must be filled'),
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
    logger.debug('Registration form submission for user:', email);

    try {
      const message = await authService.register(registerData);
      logger.info('Registration successful for user:', email);
      toast.success(message || t('registerForm.registrationSuccess'));
      onRegistrationSuccess(email);
      
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
