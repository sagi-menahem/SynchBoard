import { useActionState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import * as authService from 'services/authService';
import type { ResetPasswordRequest } from 'types/UserTypes';

interface ResetPasswordState {
  success: boolean;
  error?: string;
}

export const useResetPasswordForm = (email: string, onResetPasswordSuccess: () => void) => {
  const { t } = useTranslation();

  const resetPasswordAction = async (_previousState: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> => {
    const resetCode = formData.get('resetCode') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!resetCode || resetCode.length !== 6) {
      return {
        success: false,
        error: t('resetPassword.validation.codeRequired', 'Please enter the 6-digit reset code'),
      };
    }

    if (!/^\d{6}$/.test(resetCode)) {
      return {
        success: false,
        error: t('resetPassword.validation.codeFormat', 'Reset code must be exactly 6 digits'),
      };
    }

    if (!newPassword) {
      return {
        success: false,
        error: t('resetPassword.validation.passwordRequired', 'Password is required'),
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        success: false,
        error: t('resetPassword.validation.passwordMismatch', 'Passwords do not match'),
      };
    }

    const resetPasswordData: ResetPasswordRequest = { 
      email, 
      resetCode,
      newPassword,
    };
    logger.debug('Reset password form submission for user:', email);

    try {
      const message = await authService.resetPassword(resetPasswordData);
      logger.info('Password reset successful for user:', email);
      toast.success(message || t('resetPassword.success', 'Password reset successful! You can now log in with your new password.'));
      onResetPasswordSuccess();
      
      return {
        success: true,
      };
    } catch (err: unknown) {
      logger.error('Password reset failed for user:', err, { email });
      return {
        success: false,
        error: err instanceof Error ? err.message : t('resetPassword.error.unknown', 'Password reset failed'),
      };
    }
  };

  const [state, submitAction, isPending] = useActionState(resetPasswordAction, {
    success: false,
  });

  return {
    state,
    submitAction,
    isPending,
  };
};