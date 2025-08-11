export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
}

export interface UserProfile {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    profilePictureUrl: string | null;
    chatBackgroundSetting: string | null;
    fontSizeSetting: string | null;
}

export interface UpdateUserProfileRequest {
    firstName: string;
    lastName: string;
    phoneNumber: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface UserPreferences {
    chatBackgroundSetting: string | null;
    fontSizeSetting: string | null;
}
