
import type { CanvasPreferences } from 'features/board/types/BoardTypes';
import type { ChangePasswordRequest, LanguagePreferences, ToolPreferences, UpdateUserProfileRequest, UserPreferences, UserProfile } from 'features/settings/types/UserTypes';
import { API_ENDPOINTS } from 'shared/constants';
import apiClient from 'shared/lib/apiClient';

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>(API_ENDPOINTS.GET_USER_PROFILE);
  return response.data;
};

export const updateUserProfile = async (data: UpdateUserProfileRequest): Promise<UserProfile> => {
  const response = await apiClient.put<UserProfile>(API_ENDPOINTS.UPDATE_USER_PROFILE, data);
  return response.data;
};

export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
  await apiClient.put(API_ENDPOINTS.UPDATE_PASSWORD, data);
};

export const uploadProfilePicture = async (file: File): Promise<UserProfile> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<UserProfile>(API_ENDPOINTS.UPLOAD_PROFILE_PICTURE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteProfilePicture = async (): Promise<UserProfile> => {
  const response = await apiClient.delete<UserProfile>(API_ENDPOINTS.DELETE_PROFILE_PICTURE);
  return response.data;
};

export const updateUserPreferences = async (data: UserPreferences): Promise<UserProfile> => {
  const response = await apiClient.put<UserProfile>(API_ENDPOINTS.UPDATE_USER_PREFERENCES, data);
  return response.data;
};

export const deleteAccount = async (): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.DELETE_ACCOUNT);
};

export const checkUserExists = async (email: string): Promise<boolean> => {
  const response = await apiClient.get<boolean>(API_ENDPOINTS.CHECK_USER_EXISTS(email));
  return response.data;
};

export const getCanvasPreferences = async (): Promise<CanvasPreferences> => {
  const response = await apiClient.get<CanvasPreferences>(API_ENDPOINTS.GET_CANVAS_PREFERENCES);
  return response.data;
};

export const updateCanvasPreferences = async (preferences: Partial<CanvasPreferences>): Promise<CanvasPreferences> => {
  const response = await apiClient.put<CanvasPreferences>(API_ENDPOINTS.UPDATE_CANVAS_PREFERENCES, preferences);
  return response.data;
};

export const getToolPreferences = async (): Promise<ToolPreferences> => {
  const response = await apiClient.get<ToolPreferences>(API_ENDPOINTS.GET_TOOL_PREFERENCES);
  return response.data;
};

export const updateToolPreferences = async (preferences: ToolPreferences): Promise<ToolPreferences> => {
  const response = await apiClient.put<ToolPreferences>(API_ENDPOINTS.UPDATE_TOOL_PREFERENCES, preferences);
  return response.data;
};

export const getLanguagePreferences = async (): Promise<LanguagePreferences> => {
  const response = await apiClient.get<LanguagePreferences>(API_ENDPOINTS.GET_LANGUAGE_PREFERENCES);
  return response.data;
};

export const updateLanguagePreferences = async (preferences: LanguagePreferences): Promise<LanguagePreferences> => {
  const response = await apiClient.put<LanguagePreferences>(API_ENDPOINTS.UPDATE_LANGUAGE_PREFERENCES, preferences);
  return response.data;
};
