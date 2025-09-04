import type { LoginRequest } from 'features/settings/types/UserTypes';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants/RoutesConstants';

import * as AuthService from '../../services/authService';
import { useAuth } from '../useAuth';

import { authValidation, extractFormData, useAuthForm } from './useAuthForm';

export const useLoginForm = () => {
  const { t } = useTranslation(['auth', 'common']);
  const { login } = useAuth();
  const navigate = useNavigate();

  return useAuthForm<LoginRequest, { token: string }>({
    formType: 'login',
    validateFormData: (formData: FormData) => {
      const email = extractFormData.email(formData);
      const password = extractFormData.password(formData);

      // Validate email
      const emailError = authValidation.validateEmail(email, t);
      if (emailError) {
        return emailError;
      }

      // Validate password
      const passwordError = authValidation.validatePassword(password, t);
      if (passwordError) {
        return passwordError;
      }

      return { email, password };
    },
    serviceCall: AuthService.login,
    onSuccess: (response) => {
      login(response.token);
      void navigate(APP_ROUTES.BOARD_LIST);
    },
    contextInfo: { action: 'login' },
    logContext: 'Login',
  });
};
