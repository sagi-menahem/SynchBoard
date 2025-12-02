import type { CanvasPreferences } from 'features/board/types/BoardTypes';
import type {
  ChangePasswordRequest,
  LanguagePreferences,
  ThemePreferences,
  ToolPreferences,
  UpdateUserProfileRequest,
  UserPreferences,
  UserProfile,
} from 'features/settings/types/UserTypes';
import { API_ENDPOINTS } from 'shared/constants';
import apiClient from 'shared/lib/apiClient';

/**
 * Fetches the current user's profile information from the server.
 *
 * @returns Promise resolving to user profile data including personal information and preferences
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>(API_ENDPOINTS.GET_USER_PROFILE);
  return response.data;
};

/**
 * Updates the user's profile information on the server.
 *
 * @param data - Profile update request containing modified personal information
 * @returns Promise resolving to updated user profile data
 */
export const updateUserProfile = async (data: UpdateUserProfileRequest): Promise<UserProfile> => {
  const response = await apiClient.put<UserProfile>(API_ENDPOINTS.UPDATE_USER_PROFILE, data);
  return response.data;
};

/**
 * Changes the user's password with current password verification.
 *
 * @param data - Password change request containing current and new passwords
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
  await apiClient.put(API_ENDPOINTS.UPDATE_PASSWORD, data);
};

/**
 * Uploads a new profile picture for the user.
 *
 * @param file - Image file to upload as profile picture
 * @returns Promise resolving to updated user profile with new picture URL
 */
export const uploadProfilePicture = async (file: File): Promise<UserProfile> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<UserProfile>(
    API_ENDPOINTS.UPLOAD_PROFILE_PICTURE,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return response.data;
};

/**
 * Deletes the user's current profile picture.
 *
 * @returns Promise resolving to updated user profile with removed picture
 */
export const deleteProfilePicture = async (): Promise<UserProfile> => {
  const response = await apiClient.delete<UserProfile>(API_ENDPOINTS.DELETE_PROFILE_PICTURE);
  return response.data;
};

/**
 * Updates user preferences including board background and visual settings.
 *
 * @param data - User preferences object with updated settings
 * @returns Promise resolving to updated user profile with new preferences
 */
export const updateUserPreferences = async (data: UserPreferences): Promise<UserProfile> => {
  const response = await apiClient.put<UserProfile>(API_ENDPOINTS.UPDATE_USER_PREFERENCES, data);
  return response.data;
};

/**
 * Permanently deletes the user's account and all associated data.
 */
export const deleteAccount = async (): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.DELETE_ACCOUNT);
};

/**
 * Checks if a user account exists for the given email address.
 *
 * @param email - Email address to check for existing account
 * @returns Promise resolving to boolean indicating if user exists
 */
export const checkUserExists = async (email: string): Promise<boolean> => {
  const response = await apiClient.get<boolean>(API_ENDPOINTS.CHECK_USER_EXISTS(email));
  return response.data;
};

/**
 * Fetches user's canvas layout preferences including split ratios and display settings.
 *
 * @returns Promise resolving to canvas preferences for workspace customization
 */
export const getCanvasPreferences = async (): Promise<CanvasPreferences> => {
  const response = await apiClient.get<CanvasPreferences>(API_ENDPOINTS.GET_CANVAS_PREFERENCES);
  return response.data;
};

/**
 * Updates user's canvas layout preferences with partial preference object.
 *
 * @param preferences - Partial canvas preferences with fields to update
 * @returns Promise resolving to updated canvas preferences
 */
export const updateCanvasPreferences = async (
  preferences: Partial<CanvasPreferences>,
): Promise<CanvasPreferences> => {
  const response = await apiClient.put<CanvasPreferences>(
    API_ENDPOINTS.UPDATE_CANVAS_PREFERENCES,
    preferences,
  );
  return response.data;
};

/**
 * Fetches user's drawing tool preferences including default tools and stroke settings.
 *
 * @returns Promise resolving to tool preferences for drawing operations
 */
export const getToolPreferences = async (): Promise<ToolPreferences> => {
  const response = await apiClient.get<ToolPreferences>(API_ENDPOINTS.GET_TOOL_PREFERENCES);
  return response.data;
};

/**
 * Updates user's drawing tool preferences with new tool settings.
 *
 * @param preferences - Complete tool preferences object with updated settings
 * @returns Promise resolving to updated tool preferences
 */
export const updateToolPreferences = async (
  preferences: ToolPreferences,
): Promise<ToolPreferences> => {
  const response = await apiClient.put<ToolPreferences>(
    API_ENDPOINTS.UPDATE_TOOL_PREFERENCES,
    preferences,
  );
  return response.data;
};

/**
 * Fetches user's language preferences for internationalization settings.
 *
 * @returns Promise resolving to language preferences with preferred locale
 */
export const getLanguagePreferences = async (): Promise<LanguagePreferences> => {
  const response = await apiClient.get<LanguagePreferences>(API_ENDPOINTS.GET_LANGUAGE_PREFERENCES);
  return response.data;
};

/**
 * Updates user's language preferences for application localization.
 *
 * @param preferences - Language preferences object with new locale settings
 * @returns Promise resolving to updated language preferences
 */
export const updateLanguagePreferences = async (
  preferences: LanguagePreferences,
): Promise<LanguagePreferences> => {
  const response = await apiClient.put<LanguagePreferences>(
    API_ENDPOINTS.UPDATE_LANGUAGE_PREFERENCES,
    preferences,
  );
  return response.data;
};

/**
 * Fetches user's theme preferences for application appearance settings.
 *
 * @returns Promise resolving to theme preferences with light/dark mode settings
 */
export const getThemePreferences = async (): Promise<ThemePreferences> => {
  const response = await apiClient.get<ThemePreferences>(API_ENDPOINTS.GET_THEME_PREFERENCES);
  return response.data;
};

/**
 * Updates user's theme preferences for application appearance customization.
 *
 * @param preferences - Theme preferences object with new appearance settings
 * @returns Promise resolving to updated theme preferences
 */
export const updateThemePreferences = async (
  preferences: ThemePreferences,
): Promise<ThemePreferences> => {
  const response = await apiClient.put<ThemePreferences>(
    API_ENDPOINTS.UPDATE_THEME_PREFERENCES,
    preferences,
  );
  return response.data;
};
