// File: frontend/src/services/authService.ts

import apiClient from './apiClient';
import type { RegisterRequest, LoginRequest, AuthResponse } from '../types/user.types';

export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', userData);
  return response.data;
};

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};