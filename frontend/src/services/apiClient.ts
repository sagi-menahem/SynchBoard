// File: frontend/src/services/apiClient.ts
import axios, { type AxiosError } from 'axios';
import i18n from 'i18n';
import toast from 'react-hot-toast';

import { API_BASE_URL, API_ENDPOINTS, AUTH_HEADER_CONFIG, PUBLIC_API_ENDPOINTS } from 'constants/api.constants';
import { LOCAL_STORAGE_KEYS } from 'constants/app.constants';

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
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const isLoginAttempt = error.config?.url === API_ENDPOINTS.LOGIN;

        if (error.response && [401, 403].includes(error.response.status) && !isLoginAttempt) {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);

            toast.error(i18n.t('errors.sessionExpired'), { id: 'session-expired' });

            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
            return Promise.reject(error);
        }

        interface BackendError {
            message: string;
        }

        const isBackendError = (data: unknown): data is BackendError => {
            return (
                typeof data === 'object' &&
                data !== null &&
                'message' in data &&
                typeof (data as BackendError).message === 'string'
            );
        };

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
                toast.error(i18n.t('errors.unexpected'), { id: 'unexpected-error' });
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
