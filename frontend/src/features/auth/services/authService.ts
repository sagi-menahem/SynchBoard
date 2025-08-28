import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResendVerificationRequest,
  VerifyEmailRequest,
} from 'features/settings/types/UserTypes';
import { API_BASE_URL, API_ENDPOINTS } from 'shared/constants/ApiConstants';
import apiClient from 'shared/lib/apiClient';

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


// OAuth Service Functions
export const redirectToGoogle = (): void => {
  window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
};

export const extractTokenFromCallback = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token');
};

export const extractErrorFromCallback = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('message');
};

export const isOAuthCallback = (): boolean => {
  return window.location.pathname === '/auth/callback' || window.location.pathname === '/auth/error';
};
