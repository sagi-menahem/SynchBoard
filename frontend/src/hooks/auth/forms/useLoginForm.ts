import { APP_ROUTES } from 'constants';

import { useActionState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AuthService } from 'services';
import type { LoginRequest } from 'types';
import { Logger } from 'utils';

import { useAuth } from 'hooks/auth/useAuth';


const logger = Logger;

interface LoginState {
  success: boolean;
  error?: string;
  data?: { token: string };
}

export const useLoginForm = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const loginAction = async (_previousState: LoginState, formData: FormData): Promise<LoginState> => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return {
        success: false,
        error: t('loginForm.validation.required', 'Email and password are required'),
      };
    }

    const credentials: LoginRequest = { email, password };
    logger.debug('Login form submission for user:', email);

    try {
      const response = await AuthService.login(credentials);
      const token = (response as { token: string }).token;
      
      logger.info('Login successful for user:', email);
      toast.success(t('loginForm.loginSuccess'));
      
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
        error: err instanceof Error ? err.message : t('loginForm.error.unknown', 'Login failed'),
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
