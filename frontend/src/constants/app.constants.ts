// File: frontend/src/constants/app.constants.ts

/**
 * Keys used for storing data in localStorage.
 * Using a constant prevents typos when accessing storage.
 */
export const LOCAL_STORAGE_KEYS = {
    AUTH_TOKEN: 'authToken',
} as const;

/**
 * General application-wide constants.
 */
export const APP_CONFIG = {
    MIN_BOARD_NAME_LENGTH: 3,
} as const;