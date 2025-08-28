import { useActionState } from 'react';

import type { VerifyEmailRequest } from 'features/settings/types/UserTypes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'shared/utils/logger';

import * as authService from '../../services/authService';

interface VerifyEmailState {
  success: boolean;
  error?: string;
}

export const useVerifyEmailForm = (email: string, onVerificationSuccess: (token: string) => void) => {
  const { t } = useTranslation(['auth', 'common']);

  const verifyEmailAction = async (_previousState: VerifyEmailState, formData: FormData): Promise<VerifyEmailState> => {
    const verificationCode = formData.get('verificationCode') as string;

    if (!verificationCode || verificationCode.length !== 6) {
      return {
        success: false,
        error: t('verifyEmail.validation.codeRequired'),
      };
    }

    if (!/^\d{6}$/.test(verificationCode)) {
      return {
        success: false,
        error: t('verifyEmail.validation.codeFormat'),
      };
    }

    const verifyData: VerifyEmailRequest = {
      email,
      verificationCode,
    };

    try {
      const response = await toast.promise(
        authService.verifyEmail(verifyData),
        {
          loading: t('loading.auth.verifyEmail'),
          success: t('success.auth.verifyEmail'),
          error: t('errors.auth.verifyEmail'),
        },
      );
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
  const { t } = useTranslation(['auth', 'common']);

  const resendVerificationCode = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await toast.promise(
        authService.resendVerificationCode({ email }),
        {
          loading: t('loading.auth.resendVerification'),
          success: (msg) => msg || t('success.auth.resendVerification'),
          error: t('errors.auth.resendVerification'),
        },
      );
      return { success: true };
    } catch (err: unknown) {
      logger.error('Resend verification code failed for user:', err, { email });
      const error = err instanceof Error ? err.message : t('verifyEmail.resend.error');
      return { success: false, error };
    }
  };

  return { resendVerificationCode };
};