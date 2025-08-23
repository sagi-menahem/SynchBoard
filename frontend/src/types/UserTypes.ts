export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    gender: 'male' | 'female';
    phoneNumber?: string;
    dateOfBirth?: string;
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
    lastName: string | null;
    gender: 'male' | 'female';
    phoneNumber: string | null;
    dateOfBirth: string | null;
    profilePictureUrl: string | null;
    chatBackgroundSetting: string | null;
}

export interface UpdateUserProfileRequest {
    firstName: string;
    lastName?: string;
    gender: 'male' | 'female';
    phoneNumber?: string;
    dateOfBirth?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface UserPreferences {
    chatBackgroundSetting: string | null;
}
