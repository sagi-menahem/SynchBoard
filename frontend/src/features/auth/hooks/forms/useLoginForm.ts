
import { useActionState } from 'react';

import type { LoginRequest } from 'features/settings/types/UserTypes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants/RoutesConstants';
import logger from 'shared/utils/logger';

import * as AuthService from '../../services/authService';
import { useAuth } from '../useAuth';

interface LoginState {
  success: boolean;
  error?: string;
  data?: { token: string };
}

export const useLoginForm = () => {
  const { t } = useTranslation(['auth', 'common']);
  const { login } = useAuth();
  const navigate = useNavigate();

  const loginAction = async (_previousState: LoginState, formData: FormData): Promise<LoginState> => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return {
        success: false,
        error: t('loginForm.validation.required'),
      };
    }

    const credentials: LoginRequest = { email, password };

    try {
      const response = await toast.promise(
        AuthService.login(credentials),
        {
          loading: t('loading.auth.login'),
          success: t('success.auth.login'),
          error: (err) => {
            let errorMessage = t('loginForm.error.unknown');
            if (err && typeof err === 'object' && 'response' in err) {
              const axiosError = err as { response?: { data?: { message?: string } }; message?: string };
              if (axiosError.response?.data?.message) {
                errorMessage = axiosError.response.data.message;
              } else if (axiosError.message) {
                errorMessage = axiosError.message;
              }
            }
            return errorMessage;
          },
        },
      );

      const token = (response as { token: string }).token;

      login(token);
      navigate(APP_ROUTES.BOARD_LIST);

      return {
        success: true,
        data: { token },
      };
    } catch (err: unknown) {
      logger.error('Login failed for user:', err, { email });

      return {
        success: false,
      };
    }
  };

  const [state, submitAction, isPending] = useActionState(loginAction, {
    success: false,
  });

  return {
    state,
    submitAction,
    isPending,
  };
};
