import type { ForgotPasswordRequest } from 'features/settings/types/UserTypes';
import { useTranslation } from 'react-i18next';

import * as authService from '../../services/authService';

import { authValidation, extractFormData, useAuthForm } from './useAuthForm';

export const useForgotPasswordForm = (onForgotPasswordSuccess: (email: string) => void) => {
  const { t } = useTranslation(['auth', 'common']);

  return useAuthForm<ForgotPasswordRequest, string>({
    formType: 'forgotPassword',
    validateFormData: (formData: FormData) => {
      const email = extractFormData.email(formData);

      const emailError = authValidation.validateEmail(email, t);
      if (emailError) {
        return emailError;
      }

      return { email };
    },
    serviceCall: authService.forgotPassword,
    onSuccess: (_, requestData) => {
      onForgotPasswordSuccess(requestData.email);
    },
    logContext: 'Forgot Password',
  });
};
