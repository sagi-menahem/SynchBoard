export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:8080/ws';

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_VERIFICATION: '/auth/resend-verification',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',

  BOARDS: '/boards',
  BOARD_OBJECTS: (boardId: number) => `/boards/${boardId}/objects`,
  UNDO: (boardId: number) => `/boards/${boardId}/undo`,
  REDO: (boardId: number) => `/boards/${boardId}/redo`,
  INVITE_MEMBER: (boardId: number) => `/boards/${boardId}/members`,
  GET_BOARD_DETAILS: (boardId: number) => `/boards/${boardId}/details`,
  REMOVE_MEMBER: (boardId: number, memberEmail: string) => `/boards/${boardId}/members/${memberEmail}`,
  PROMOTE_MEMBER: (boardId: number, memberEmail: string) => `/boards/${boardId}/members/${memberEmail}/promote`,
  UPDATE_BOARD_NAME: (boardId: number) => `/boards/${boardId}/name`,
  UPDATE_BOARD_DESCRIPTION: (boardId: number) => `/boards/${boardId}/description`,
  LEAVE_BOARD: (boardId: number) => `/boards/${boardId}/members/leave`,
  UPLOAD_BOARD_PICTURE: (boardId: number) => `/boards/${boardId}/picture`,
  DELETE_BOARD_PICTURE: (boardId: number) => `/boards/${boardId}/picture`,
  GET_BOARD_MESSAGES: (boardId: number) => `/boards/${boardId}/messages`,

  GET_USER_PROFILE: '/user/profile',
  UPDATE_USER_PROFILE: '/user/profile',
  UPDATE_PASSWORD: '/user/password',
  UPLOAD_PROFILE_PICTURE: '/user/profile-picture',
  DELETE_PROFILE_PICTURE: '/user/profile-picture',
  UPDATE_USER_PREFERENCES: '/user/preferences',
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
];

export const WEBSOCKET_DESTINATIONS = {
  DRAW_ACTION: '/app/board.drawAction',
  SEND_MESSAGE: '/app/chat.sendMessage',
} as const;

export const WEBSOCKET_TOPICS = {
  BOARD: (boardId: number) => `/topic/board/${boardId}` as const,
  USER: (userEmail: string) => `/topic/user/${userEmail}` as const,
} as const;

export type WebSocketDestination = typeof WEBSOCKET_DESTINATIONS[keyof typeof WEBSOCKET_DESTINATIONS];
export type WebSocketTopicFactory = typeof WEBSOCKET_TOPICS[keyof typeof WEBSOCKET_TOPICS];

export const AUTH_HEADER_CONFIG = {
  HEADER_NAME: 'Authorization',
  TOKEN_PREFIX: 'Bearer ',
} as const;
