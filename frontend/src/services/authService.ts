// Located at: frontend/src/services/authService.ts

import apiClient from './apiClient';
import type { RegisterRequest, LoginRequest, AuthResponse } from '../types/user.types';

/**
 * Sends a registration request to the backend API.
 * @param userData - An object containing the new user's registration details.
 * @returns A promise that resolves to an AuthResponse object containing a JWT.
 */
export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  // We specify that the expected response data will be of type AuthResponse
  const response = await apiClient.post<AuthResponse>('/auth/register', userData);
  return response.data;
};

/**
 * Sends a login request to the backend API.
 * @param credentials - An object containing the user's email and password.
 * @returns A promise that resolves to an AuthResponse object containing a JWT.
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  // We specify that the expected response data will be of type AuthResponse
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};