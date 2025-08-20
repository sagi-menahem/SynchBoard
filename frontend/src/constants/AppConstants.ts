export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
} as const;

export const APP_CONFIG = {
  MIN_BOARD_NAME_LENGTH: 3,
  MIN_PASSWORD_LENGTH: 8,
  ALLOWED_IMAGE_TYPES: 'image/png, image/jpeg, image/gif',
} as const;

export const WEBSOCKET_CONFIG = {
  // Set to 480KB to leave a buffer for STOMP protocol overhead (headers, auth, metadata)
  // Server limit is 512KB, but STOMP wrapping can add 5-15KB per message
  MAX_MESSAGE_SIZE: import.meta.env.VITE_WEBSOCKET_MAX_MESSAGE_SIZE 
    ? parseInt(import.meta.env.VITE_WEBSOCKET_MAX_MESSAGE_SIZE) 
    : 480 * 1024,
  // Reconnection configuration
  MAX_RECONNECTION_ATTEMPTS: import.meta.env.VITE_WEBSOCKET_MAX_RECONNECTION_ATTEMPTS 
    ? parseInt(import.meta.env.VITE_WEBSOCKET_MAX_RECONNECTION_ATTEMPTS) 
    : 5, // Reduced for school project
  BASE_RECONNECTION_DELAY: import.meta.env.VITE_WEBSOCKET_BASE_RECONNECTION_DELAY 
    ? parseInt(import.meta.env.VITE_WEBSOCKET_BASE_RECONNECTION_DELAY) 
    : 2000, // 2 seconds
  // Transaction timeout - how long to wait for server confirmation before giving up
  TRANSACTION_TIMEOUT: import.meta.env.VITE_TRANSACTION_TIMEOUT
    ? parseInt(import.meta.env.VITE_TRANSACTION_TIMEOUT)
    : 15000, // 15 seconds - reasonable for school project
} as const;
