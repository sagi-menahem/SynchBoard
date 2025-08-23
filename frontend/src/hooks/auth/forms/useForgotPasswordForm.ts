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

  const forgotPasswordAction = async (_previousState: ForgotPasswordState, formData: FormData): Promise<ForgotPasswordState> => {
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
    logger.debug('Forgot password form submission for user:', email);

    try {
      const message = await authService.forgotPassword(forgotPasswordData);
      logger.info('Forgot password request successful for user:', email);
      toast.success(message || t('forgotPassword.success', 'Password reset code sent to your email!'));
      onForgotPasswordSuccess(email);
      
      return {
        success: true,
      };
    } catch (err: unknown) {
      logger.error('Forgot password request failed for user:', err, { email });
      return {
        success: false,
        error: err instanceof Error ? err.message : t('forgotPassword.error.unknown', 'Failed to send password reset code'),
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