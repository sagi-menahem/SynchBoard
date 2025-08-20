import { APP_ROUTES } from 'constants';

import { useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AuthService } from 'services';
import type { LoginRequest } from 'types';
import { Logger } from 'utils';

import { useAuth } from 'hooks/auth/useAuth';


const logger = Logger;


export const useLoginForm = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const credentials: LoginRequest = { email, password };

    logger.debug('Login form submission for user:', email);

    AuthService
      .login(credentials)
      .then((response: unknown) => {
        logger.info('Login successful for user:', email);
        toast.success(t('loginForm.loginSuccess'));
        login((response as { token: string }).token);
        navigate(APP_ROUTES.BOARD_LIST);
      })
      .catch((err: unknown) => {
        logger.error('Login failed for user:', err, { email });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return {
    email,
    password,
    isSubmitting,
    setEmail,
    setPassword,
    handleSubmit,
  };
};
