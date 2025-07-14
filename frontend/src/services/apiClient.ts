// File: frontend/src/services/apiClient.ts
import axios from 'axios';
import { API_BASE_URL, AUTH_HEADER_CONFIG, PUBLIC_API_ENDPOINTS } from '../constants/api.constants';
import { LOCAL_STORAGE_KEYS } from '../constants/app.constants';

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
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;