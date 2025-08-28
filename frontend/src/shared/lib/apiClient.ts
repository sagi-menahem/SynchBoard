import axios, { type AxiosError } from 'axios';
import toast from 'react-hot-toast';
import {
  API_BASE_URL,
  API_ENDPOINTS,
  AUTH_HEADER_CONFIG,
  PUBLIC_API_ENDPOINTS,
} from 'shared/constants/ApiConstants';
import { LOCAL_STORAGE_KEYS } from 'shared/constants/AppConstants';
import i18n from 'shared/lib/i18n';
import { isBackendError } from 'shared/utils';
import logger from 'shared/utils/logger';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const isPublicEndpoint = config.url ? PUBLIC_API_ENDPOINTS.includes(config.url) : false;

    if (!isPublicEndpoint) {
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers[AUTH_HEADER_CONFIG.HEADER_NAME] = `${AUTH_HEADER_CONFIG.TOKEN_PREFIX}${token}`;
      } else {
        logger.warn('No auth token available for protected endpoint');
      }
    }
    return config;
  },
  (error) => {
    logger.error('API Request interceptor error', error);
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    logger.error('[API] Error Response', {
      status: error.response?.status ?? 'Network Error',
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      currentPath: window.location.pathname,
      hasToken: !!localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN),
      errorData: error.response?.data,
    });

    const isLoginAttempt = error.config?.url === API_ENDPOINTS.LOGIN;

    const isBoardRequest = error.config?.url?.includes('/boards/');
    const responseData = error.response?.data as { message?: string } | undefined;
    const isUserNotFoundError = (error.response?.status === 500 &&
      responseData?.message?.includes?.('User not found')) || // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
      (error.response?.status === 500 &&
      error.message?.includes?.('User not found'));
    const isOAuthRedirectError = !error.response &&
      (error.message?.includes?.('CORS') ||
        error.message?.includes?.('blocked by CORS policy') ||
        error.code === 'ERR_NETWORK') &&
      localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const isSessionTimeout = (error.response && [401, 403].includes(error.response.status) && !isLoginAttempt) ||
      (isUserNotFoundError && !isLoginAttempt) ||
      (isOAuthRedirectError && !isLoginAttempt);

    if (isSessionTimeout) {
      if (error.response?.status === 401 || !isBoardRequest || isUserNotFoundError || isOAuthRedirectError) {
        const reason = (() => {
          if (isUserNotFoundError) {
            return 'user not found in database';
          }
          if (isOAuthRedirectError) {
            return 'OAuth redirect (expired session)';
          }
          return `${error.response?.status} response`;
        })();
        logger.warn(`[API] Session invalidated due to ${reason}`, {
          currentPath: window.location.pathname,
          clearingToken: true,
          timestamp: new Date().toISOString(),
          isUserNotFoundError,
          isOAuthRedirectError,
        });
        localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);

        toast.error(i18n.t('errors.auth.sessionExpired'), { id: 'session-expired' });

        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth';
        }
        return Promise.reject(error);
      }
    }


    if (error.response && isBackendError(error.response.data) && !isLoginAttempt) {
      const backendKey = error.response.data.message;
      const fullKey = `errors.${backendKey}`;

      if (i18n.exists(fullKey)) {
        toast.error(i18n.t(fullKey), { id: fullKey });
      } else {
        toast.error(backendKey, { id: backendKey });
      }
    } else {
      if (!isLoginAttempt) {
        logger.error('Unexpected error without backend message', error);
        toast.error(i18n.t('errors.common.unexpected'), { id: 'unexpected-error' });
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
