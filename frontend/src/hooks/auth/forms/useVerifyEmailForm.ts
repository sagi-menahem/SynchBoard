import { useActionState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import * as authService from 'services/authService';
import type { VerifyEmailRequest } from 'types/UserTypes';

interface VerifyEmailState {
  success: boolean;
  error?: string;
}

export const useVerifyEmailForm = (email: string, onVerificationSuccess: (token: string) => void) => {
  const { t } = useTranslation();

  const verifyEmailAction = async (_previousState: VerifyEmailState, formData: FormData): Promise<VerifyEmailState> => {
    const verificationCode = formData.get('verificationCode') as string;

    if (!verificationCode || verificationCode.length !== 6) {
      return {
        success: false,
        error: t('verifyEmail.validation.codeRequired', 'Please enter the 6-digit verification code'),
      };
    }

    if (!/^\d{6}$/.test(verificationCode)) {
      return {
        success: false,
        error: t('verifyEmail.validation.codeFormat', 'Verification code must be exactly 6 digits'),
      };
    }

    const verifyData: VerifyEmailRequest = { 
      email, 
      verificationCode,
    };
    logger.debug('Email verification form submission for user:', email);

    try {
      const response = await authService.verifyEmail(verifyData);
      logger.info('Email verification successful for user:', email);
      toast.success(t('verifyEmail.success', 'Email verified successfully!'));
      onVerificationSuccess(response.token);
      
      return {
        success: true,
      };
    } catch (err: unknown) {
      logger.error('Email verification failed for user:', err, { email });
      return {
        success: false,
      };
    }
  };

  const [state, submitAction, isPending] = useActionState(verifyEmailAction, {
    success: false,
  });

  return {
    state,
    submitAction,
    isPending,
  };
};

export const useResendVerificationCode = (email: string) => {
  const { t } = useTranslation();

  const resendVerificationCode = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const message = await authService.resendVerificationCode({ email });
      logger.info('Verification code resent for user:', email);
      toast.success(message || t('verifyEmail.resend.success', 'Verification code sent successfully!'));
      return { success: true };
    } catch (err: unknown) {
      logger.error('Resend verification code failed for user:', err, { email });
      const error = err instanceof Error ? err.message : t('verifyEmail.resend.error', 'Failed to resend verification code');
      toast.error(error);
      return { success: false, error };
    }
  };

  return { resendVerificationCode };
};