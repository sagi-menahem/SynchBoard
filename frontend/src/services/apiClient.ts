// File: frontend/src/services/apiClient.ts
import axios, { type AxiosError } from 'axios';
import { API_BASE_URL, AUTH_HEADER_CONFIG, PUBLIC_API_ENDPOINTS } from 'constants/api.constants';
import { LOCAL_STORAGE_KEYS } from 'constants/app.constants';
import i18n from 'i18n';
import toast from 'react-hot-toast';

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
        interface BackendError {
            message: string;
        }

        const isBackendError = (data: unknown): data is BackendError => {
            return typeof data === 'object' && data !== null && 'message' in data && typeof (data as BackendError).message === 'string';
        };

        if (error.response && isBackendError(error.response.data)) {
            const backendKey = error.response.data.message;

            const fullKey = `errors.${backendKey}`;

            if (i18n.exists(fullKey)) {
                toast.error(i18n.t(fullKey));
            } else {
                toast.error(backendKey);
            }
        } else {
            toast.error(i18n.t('errors.unexpected'));
        }

        return Promise.reject(error);
    }
);

export default apiClient;