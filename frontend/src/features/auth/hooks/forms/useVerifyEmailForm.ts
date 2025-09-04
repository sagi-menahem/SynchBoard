import type { VerifyEmailRequest } from 'features/settings/types/UserTypes';
import { useTranslation } from 'react-i18next';
import logger from 'shared/utils/logger';
import { toastPromise } from 'shared/utils/toastUtils';

import * as authService from '../../services/authService';

import { authValidation, extractFormData, useAuthForm } from './useAuthForm';

export const useVerifyEmailForm = (
  email: string,
  onVerificationSuccess: (token: string) => void,
) => {
  const { t } = useTranslation(['auth', 'common']);

  return useAuthForm<VerifyEmailRequest, { token: string }>({
    formType: 'verifyEmail',
    validateFormData: (formData: FormData) => {
      const verificationCode = extractFormData.verificationCode(formData);

      const codeError = authValidation.validateVerificationCode(verificationCode, t);
      if (codeError) {
        return codeError;
      }

      return {
        email,
        verificationCode,
      };
    },
    serviceCall: authService.verifyEmail,
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
      await toastPromise(authService.resendVerificationCode({ email }), {
        loading: t('auth:loading.resendVerification'),
        success: t('auth:success.resendVerification'),
        error: t('auth:errors.resendVerification'),
      });
      return { success: true };
    } catch (err: unknown) {
      logger.error('Resend verification code failed for user:', err, { email });
      const error = err instanceof Error ? err.message : t('auth:verifyEmail.resend.error');
      return { success: false, error };
    }
  };

  return { resendVerificationCode };
};
