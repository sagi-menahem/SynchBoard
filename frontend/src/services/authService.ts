import { API_ENDPOINTS } from 'constants/api.constants';
import type { AuthResponse, LoginRequest, RegisterRequest } from 'types/user.types';

import apiClient from './apiClient';

export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.REGISTER, userData);
    return response.data;
};

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.LOGIN, credentials);
    return response.data;
};
