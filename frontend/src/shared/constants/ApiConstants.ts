/**
 * API configuration constants for the SynchBoard application.
 * Contains base URLs, endpoint definitions, WebSocket destinations, and authentication headers
 * used throughout the application for communicating with the backend REST API and WebSocket services.
 * Endpoints are organized by feature (auth, boards, user) and include both static paths and
 * dynamic path generators that accept parameters like board IDs and user emails.
 */

// In Docker, these will be proxied through Nginx, so we use relative URLs
// In development, these will use the environment variables or default to localhost
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
export const WEBSOCKET_PATH = import.meta.env.VITE_WEBSOCKET_URL ?? '/ws';

/**
 * Constructs the full WebSocket URL for native WebSocket connections.
 * Handles both development (direct backend connection) and production (nginx proxy) scenarios.
 * Automatically determines the correct protocol (ws:// or wss://) based on the current page protocol.
 *
 * Supported VITE_WEBSOCKET_URL formats:
 * - Full WebSocket URL: 'ws://localhost:8080/ws' or 'wss://example.com/ws'
 * - Full HTTP URL (converted to WS): 'http://localhost:8080/ws' or 'https://example.com/ws'
 * - Relative path: '/ws' (uses current page host)
 *
 * @returns Full WebSocket URL (e.g., 'ws://localhost:8080/ws' or 'wss://synchboard.com/ws')
 */
export function getWebSocketUrl(): string {
  // If already a WebSocket URL, use it directly
  if (WEBSOCKET_PATH.startsWith('ws://') || WEBSOCKET_PATH.startsWith('wss://')) {
    return WEBSOCKET_PATH;
  }

  // If it's an HTTP/HTTPS URL, convert to WebSocket protocol
  if (WEBSOCKET_PATH.startsWith('http://')) {
    return WEBSOCKET_PATH.replace('http://', 'ws://');
  }
  if (WEBSOCKET_PATH.startsWith('https://')) {
    return WEBSOCKET_PATH.replace('https://', 'wss://');
  }

  // Otherwise, it's a relative path - construct the URL from the current page location
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;

  return `${protocol}//${host}${WEBSOCKET_PATH}`;
}

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_VERIFICATION: '/auth/resend-verification',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  GOOGLE_ONE_TAP: '/auth/google-one-tap',

  BOARDS: '/boards',
  BOARD_OBJECTS: (boardId: number) => `/boards/${boardId}/objects`,
  UNDO: (boardId: number) => `/boards/${boardId}/undo`,
  REDO: (boardId: number) => `/boards/${boardId}/redo`,
  INVITE_MEMBER: (boardId: number) => `/boards/${boardId}/members`,
  GET_BOARD_DETAILS: (boardId: number) => `/boards/${boardId}/details`,
  REMOVE_MEMBER: (boardId: number, memberEmail: string) =>
    `/boards/${boardId}/members/${memberEmail}`,
  PROMOTE_MEMBER: (boardId: number, memberEmail: string) =>
    `/boards/${boardId}/members/${memberEmail}/promote`,
  UPDATE_BOARD_NAME: (boardId: number) => `/boards/${boardId}/name`,
  UPDATE_BOARD_DESCRIPTION: (boardId: number) => `/boards/${boardId}/description`,
  LEAVE_BOARD: (boardId: number) => `/boards/${boardId}/members/leave`,
  UPLOAD_BOARD_PICTURE: (boardId: number) => `/boards/${boardId}/picture`,
  DELETE_BOARD_PICTURE: (boardId: number) => `/boards/${boardId}/picture`,
  GET_BOARD_MESSAGES: (boardId: number) => `/boards/${boardId}/messages`,
  UPDATE_CANVAS_SETTINGS: (boardId: number) => `/boards/${boardId}/canvas-settings`,

  GET_USER_PROFILE: '/user/profile',
  UPDATE_USER_PROFILE: '/user/profile',
  UPDATE_PASSWORD: '/user/password',
  UPLOAD_PROFILE_PICTURE: '/user/profile-picture',
  DELETE_PROFILE_PICTURE: '/user/profile-picture',
  UPDATE_USER_PREFERENCES: '/user/preferences',
  GET_CANVAS_PREFERENCES: '/user/canvas-preferences',
  UPDATE_CANVAS_PREFERENCES: '/user/canvas-preferences',
  GET_TOOL_PREFERENCES: '/user/tool-preferences',
  UPDATE_TOOL_PREFERENCES: '/user/tool-preferences',
  GET_LANGUAGE_PREFERENCES: '/user/language-preferences',
  UPDATE_LANGUAGE_PREFERENCES: '/user/language-preferences',
  GET_THEME_PREFERENCES: '/user/theme-preferences',
  UPDATE_THEME_PREFERENCES: '/user/theme-preferences',
  DELETE_ACCOUNT: '/user/account',
  CHECK_USER_EXISTS: (email: string) => `/user/exists/${encodeURIComponent(email)}`,
} as const;

export const PUBLIC_API_ENDPOINTS: readonly string[] = [
  API_ENDPOINTS.LOGIN,
  API_ENDPOINTS.REGISTER,
  API_ENDPOINTS.VERIFY_EMAIL,
  API_ENDPOINTS.RESEND_VERIFICATION,
  API_ENDPOINTS.FORGOT_PASSWORD,
  API_ENDPOINTS.RESET_PASSWORD,
  API_ENDPOINTS.GOOGLE_ONE_TAP,
  '/config/features',
];

export const WEBSOCKET_DESTINATIONS = {
  DRAW_ACTION: '/app/board.drawAction',
  SEND_MESSAGE: '/app/chat.sendMessage',
  CANVAS_SETTINGS_UPDATE: '/app/board.canvasSettingsUpdate',
} as const;

export const WEBSOCKET_TOPICS = {
  BOARD: (boardId: number) => `/topic/board/${boardId}` as const,
  USER: (userEmail: string) => `/topic/user/${userEmail}` as const,
} as const;

export const AUTH_HEADER_CONFIG = {
  HEADER_NAME: 'Authorization',
  TOKEN_PREFIX: 'Bearer ',
} as const;
