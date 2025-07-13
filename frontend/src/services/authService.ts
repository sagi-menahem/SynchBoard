// File: frontend/src/services/authService.ts

import apiClient from './apiClient';
import type { RegisterRequest, LoginRequest, AuthResponse } from '../types/user.types';
import { API_ENDPOINTS } from '../constants/api.constants';

export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.REGISTER, userData);
    return response.data;
};

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.LOGIN, credentials);
    return response.data;
};