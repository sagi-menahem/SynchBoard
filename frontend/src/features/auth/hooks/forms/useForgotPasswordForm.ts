import type { ForgotPasswordRequest } from 'features/settings/types/UserTypes';
import { useTranslation } from 'react-i18next';
import { useFormWithToast } from 'shared/hooks/useFormWithToast';
import { validateEmail } from 'shared/utils/validationUtils';

import * as authService from '../../services/authService';

export const useForgotPasswordForm = (onForgotPasswordSuccess: (email: string) => void) => {
  const { t } = useTranslation(['auth', 'common']);

  return useFormWithToast<ForgotPasswordRequest, string>({
    validateFormData: (formData: FormData) => {
      const email = formData.get('email') as string;

      if (!email) {
        return { error: t('auth:forgotPassword.validation.emailRequired') };
      }

      if (!validateEmail(email)) {
        return { error: t('forgotPassword.validation.emailInvalid') };
      }

      return { email };
    },
    serviceCall: authService.forgotPassword,
    toastMessages: {
      loading: t('loading.auth.forgotPassword'),
      success: (msg) => msg || t('success.auth.forgotPassword'),
      error: t('errors.auth.forgotPassword'),
    },
    onSuccess: (_, requestData) => {
      onForgotPasswordSuccess(requestData.email);
    },
    logContext: 'Forgot Password',
  });
};