// File: frontend/src/constants/api.constants.ts

export const API_BASE_URL = 'http://localhost:8080/api';
export const WEBSOCKET_URL = 'http://localhost:8080/ws';

export const API_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    BOARDS: '/boards',
    BOARD_OBJECTS: (boardId: number) => `/boards/${boardId}/objects`,
    UNDO: (boardId: number) => `/boards/${boardId}/undo`,
    REDO: (boardId: number) => `/boards/${boardId}/redo`,
} as const;

export const PUBLIC_API_ENDPOINTS: readonly string[] = [
    API_ENDPOINTS.LOGIN,
    API_ENDPOINTS.REGISTER,
];

export const WEBSOCKET_DESTINATIONS = {
    DRAW_ACTION: '/app/board.drawAction',
    SEND_MESSAGE: '/app/chat.sendMessage',
} as const;

export const WEBSOCKET_TOPICS = {
    BOARD: (boardId: number) => `/topic/board/${boardId}`,
} as const;

export const AUTH_HEADER_CONFIG = {
    HEADER_NAME: 'Authorization',
    TOKEN_PREFIX: 'Bearer ',
} as const;