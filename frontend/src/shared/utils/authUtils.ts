import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
}

const TOKEN_KEY = 'token';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isTokenValid = (token?: string | null): boolean => {
  const tokenToCheck = token || getToken();

  if (!tokenToCheck) {
    return false;
  }

  try {
    const decoded = decodeToken(tokenToCheck);
    if (!decoded) {
      return false;
    }

    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

export const decodeToken = (token?: string | null): JwtPayload | null => {
  const tokenToDecode = token || getToken();

  if (!tokenToDecode) {
    return null;
  }

  try {
    return jwtDecode<JwtPayload>(tokenToDecode);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getTokenExpiry = (token?: string | null): number | null => {
  const decoded = decodeToken(token);
  return decoded ? decoded.exp : null;
};

export const getUserEmailFromToken = (token?: string | null): string | null => {
  const decoded = decodeToken(token);
  return decoded ? decoded.sub : null;
};

export const shouldRefreshToken = (token?: string | null): boolean => {
  const expiry = getTokenExpiry(token);

  if (!expiry) {
    return false;
  }

  const currentTime = Date.now() / 1000;
  const timeUntilExpiry = expiry - currentTime;

  // Refresh if less than 5 minutes remaining
  return timeUntilExpiry < 300 && timeUntilExpiry > 0;
};
