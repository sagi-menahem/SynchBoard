import { API_ENDPOINTS } from 'constants';

import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from 'types/UserTypes';

import apiClient from './apiClient';

export const register = async (userData: RegisterRequest): Promise<string> => {
  const response = await apiClient.post<string>(API_ENDPOINTS.REGISTER, userData);
  return response.data;
};

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.LOGIN, credentials);
  return response.data;
};

export const verifyEmail = async (data: VerifyEmailRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.VERIFY_EMAIL, data);
  return response.data;
};

export const resendVerificationCode = async (data: ResendVerificationRequest): Promise<string> => {
  const response = await apiClient.post<string>(API_ENDPOINTS.RESEND_VERIFICATION, data);
  return response.data;
};

export const forgotPassword = async (data: ForgotPasswordRequest): Promise<string> => {
  const response = await apiClient.post<string>(API_ENDPOINTS.FORGOT_PASSWORD, data);
  return response.data;
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<string> => {
  const response = await apiClient.post<string>(API_ENDPOINTS.RESET_PASSWORD, data);
  return response.data;
};
