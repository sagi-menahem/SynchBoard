
import type { LoginRequest } from 'features/settings/types/UserTypes';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants/RoutesConstants';
import { useFormWithToast } from 'shared/hooks/useFormWithToast';

import * as AuthService from '../../services/authService';
import { useAuth } from '../useAuth';

export const useLoginForm = () => {
  const { t } = useTranslation(['auth', 'common']);
  const { login } = useAuth();
  const navigate = useNavigate();

  return useFormWithToast<LoginRequest, { token: string }>({
    validateFormData: (formData: FormData) => {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      if (email === null || email === '' || password === null || password === '') {
        return { error: t('loginForm.validation.required') };
      }

      return { email, password };
    },
    serviceCall: AuthService.login,
    toastMessages: {
      loading: t('loading.auth.login'),
      success: t('success.auth.login'),
      error: (err) => {
        let errorMessage = t('loginForm.error.unknown');
        if (err !== null && err !== undefined && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { data?: { message?: string } }; message?: string };
          if (axiosError.response?.data?.message !== undefined && axiosError.response?.data?.message !== '') {
            errorMessage = axiosError.response.data.message;
          } else if (axiosError.message !== undefined && axiosError.message !== '') {
            errorMessage = axiosError.message;
          }
        }
        return errorMessage;
      },
    },
    onSuccess: (response) => {
      login(response.token);
      void navigate(APP_ROUTES.BOARD_LIST);
    },
    contextInfo: { action: 'login' },
    logContext: 'Login',
  });
};
