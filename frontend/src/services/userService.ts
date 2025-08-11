import { API_ENDPOINTS } from 'constants/ApiConstants';
import type { ChangePasswordRequest, UpdateUserProfileRequest, UserPreferences, UserProfile } from 'types/user.types';

import apiClient from './apiClient';

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
