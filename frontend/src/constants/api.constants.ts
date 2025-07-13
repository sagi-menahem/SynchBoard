// File: frontend/src/constants/api.constants.ts

/**
 * Base URLs for the server.
 */
export const API_BASE_URL = 'http://localhost:8080/api';
export const WEBSOCKET_URL = 'http://localhost:8080/ws';

/**
 * API endpoint paths.
 * Using a function for dynamic paths ensures consistency.
 */
export const API_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    BOARDS: '/boards',
    BOARD_OBJECTS: (boardId: number) => `/boards/${boardId}/objects`,
} as const;

/**
 * A list of public API endpoints that do not require an Authorization header.
 */
export const PUBLIC_API_ENDPOINTS: readonly string[] = [
    API_ENDPOINTS.LOGIN,
    API_ENDPOINTS.REGISTER,
];

/**
 * WebSocket destinations for sending messages to the server.
 */
export const WEBSOCKET_DESTINATIONS = {
    DRAW_ACTION: '/app/board.drawAction',
    SEND_MESSAGE: '/app/chat.sendMessage',
} as const;

/**
 * WebSocket topics for subscribing to server events.
 */
export const WEBSOCKET_TOPICS = {
    BOARD: (boardId: number) => `/topic/board/${boardId}`,
} as const;

/**
 * Common HTTP Header names and prefixes.
 */
export const AUTH_HEADER_CONFIG = {
    HEADER_NAME: 'Authorization',
    TOKEN_PREFIX: 'Bearer ',
} as const;