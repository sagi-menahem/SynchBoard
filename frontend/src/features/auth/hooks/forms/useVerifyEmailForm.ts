import type { VerifyEmailRequest } from 'features/settings/types/UserTypes';
import { useTranslation } from 'react-i18next';
import { useFormWithToast } from 'shared/hooks/useFormWithToast';
import logger from 'shared/utils/logger';
import { toastPromise } from 'shared/utils/toastUtils';

import * as authService from '../../services/authService';

export const useVerifyEmailForm = (email: string, onVerificationSuccess: (token: string) => void) => {
  const { t } = useTranslation(['auth', 'common']);

  return useFormWithToast<VerifyEmailRequest, { token: string }>({
    validateFormData: (formData: FormData) => {
      const verificationCode = formData.get('verificationCode') as string;

      if (verificationCode === null || verificationCode === '' || verificationCode.length !== 6) {
        return { error: t('verifyEmail.validation.codeRequired') };
      }

      if (!/^\d{6}$/.test(verificationCode)) {
        return { error: t('verifyEmail.validation.codeFormat') };
      }

      return {
        email,
        verificationCode,
      };
    },
    serviceCall: authService.verifyEmail,
    toastMessages: {
      loading: t('loading.auth.verifyEmail'),
      success: t('success.auth.verifyEmail'),
      error: t('errors.auth.verifyEmail'),
    },
    onSuccess: (response) => {
      onVerificationSuccess(response.token);
    },
    contextInfo: { email },
    logContext: 'Email verification',
  });
};

export const useResendVerificationCode = (email: string) => {
  const { t } = useTranslation(['auth', 'common']);

  const resendVerificationCode = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await toastPromise(
        authService.resendVerificationCode({ email }),
        {
          loading: t('loading.auth.resendVerification'),
          success: t('success.auth.resendVerification'),
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