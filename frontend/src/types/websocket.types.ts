// File: frontend/src/types/websocket.types.ts

// This file will hold all DTOs related to WebSocket communication.

export interface BoardUpdateDTO {
    updateType: 'DETAILS_UPDATED' | 'MEMBERS_UPDATED';
    sourceUserEmail: string;
}

export interface UserUpdateDTO {
    updateType: 'BOARD_LIST_CHANGED';
}