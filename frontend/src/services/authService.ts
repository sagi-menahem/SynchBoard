// File: frontend/src/services/authService.ts

import apiClient from './apiClient';
import type { RegisterRequest } from '../types/user.types';

/**
 * Sends a registration request to the backend API.
 * @param userData - An object containing the new user's registration details.
 * @returns The response data from the server.
 */
export const register = async (userData: RegisterRequest) => {
  const response = await apiClient.post('/api/auth/register', userData);
  return response.data;
};

// TODO: Implement a login function to authenticate users.
// It should accept credentials and return an authentication token.
/*
export const login = async (credentials: LoginRequest) => {
  const response = await apiClient.post('/api/auth/login', credentials);
  // Assuming the server returns a token
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
  }
  return response.data;
};
*/