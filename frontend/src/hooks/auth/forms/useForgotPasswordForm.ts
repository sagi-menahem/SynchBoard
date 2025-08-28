import { useActionState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import * as authService from 'services/authService';
import type { ForgotPasswordRequest } from 'types/UserTypes';

interface ForgotPasswordState {
  success: boolean;
  error?: string;
}

export const useForgotPasswordForm = (onForgotPasswordSuccess: (email: string) => void) => {
  const { t } = useTranslation();

  const forgotPasswordAction = async (
    _previousState: ForgotPasswordState, 
    formData: FormData,
  ): Promise<ForgotPasswordState> => {
    const email = formData.get('email') as string;

    if (!email) {
      return {
        success: false,
        error: t('forgotPassword.validation.emailRequired', 'Email is required'),
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: t('forgotPassword.validation.emailInvalid', 'Please enter a valid email address'),
      };
    }

    const forgotPasswordData: ForgotPasswordRequest = { email };

    try {
      await toast.promise(
        authService.forgotPassword(forgotPasswordData),
        {
          loading: t('loading.auth.forgotPassword'),
          success: (msg) => msg || t('success.auth.forgotPassword'),
          error: t('errors.auth.forgotPassword'),
        },
      );
      onForgotPasswordSuccess(email);
      
      return {
        success: true,
      };
    } catch (err: unknown) {
      logger.error('Forgot password request failed for user:', err, { email });
      return {
        success: false,
      };
    }
  };

  const [state, submitAction, isPending] = useActionState(forgotPasswordAction, {
    success: false,
  });

  return {
    state,
    submitAction,
    isPending,
  };
};