// File: frontend/src/types/user.types.ts
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}
export interface LoginRequest {
    email:    string;
    password: string;
}

export interface AuthResponse {
    token: string;
}