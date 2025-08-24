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
    boardBackgroundSetting: string | null;
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
    boardBackgroundSetting: string | null;
}

export interface VerifyEmailRequest {
    email: string;
    verificationCode: string;
}

export interface ResendVerificationRequest {
    email: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    email: string;
    resetCode: string;
    newPassword: string;
}
