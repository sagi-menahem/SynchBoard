import {
    API_BASE_URL,
    API_ENDPOINTS,
    AUTH_HEADER_CONFIG,
    LOCAL_STORAGE_KEYS,
    PUBLIC_API_ENDPOINTS
} from 'constants';

import axios, { type AxiosError } from 'axios';
import i18n from 'i18n';
import toast from 'react-hot-toast';
import { Logger } from 'utils';
import { isBackendError } from 'utils';

const logger = Logger;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const isPublicEndpoint = config.url ? PUBLIC_API_ENDPOINTS.includes(config.url) : false;
        
        logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            headers: isPublicEndpoint ? 'public' : 'authenticated',
            params: config.params
        });
        
        if (!isPublicEndpoint) {
            const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
            if (token) {
                config.headers[AUTH_HEADER_CONFIG.HEADER_NAME] = `${AUTH_HEADER_CONFIG.TOKEN_PREFIX}${token}`;
                logger.debug('Auth token attached to request');
            } else {
                logger.warn('No auth token available for protected endpoint');
            }
        }
        return config;
    },
    (error) => {
        logger.error('API Request interceptor error', error);
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        logger.debug(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
    },
    (error: AxiosError) => {
        logger.error(`API Error: ${error.response?.status || 'Network Error'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error);
        
        const isLoginAttempt = error.config?.url === API_ENDPOINTS.LOGIN;

        const isBoardRequest = error.config?.url?.includes('/boards/');

        if (error.response && [401, 403].includes(error.response.status) && !isLoginAttempt) {
            if (error.response.status === 401 || !isBoardRequest) {
                logger.warn(`Session invalidated due to ${error.response.status} response`);
                localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);

                toast.error(i18n.t('errors.sessionExpired'), { id: 'session-expired' });

                if (window.location.pathname !== '/') {
                    logger.info('Redirecting to login page due to authentication failure');
                    window.location.href = '/';
                }
                return Promise.reject(error);
            }
        }


        if (error.response && isBackendError(error.response.data)) {
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
                toast.error(i18n.t('errors.unexpected'), { id: 'unexpected-error' });
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
