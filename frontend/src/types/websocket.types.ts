// File: frontend/src/types/websocket.types.ts

// --- Existing Chat Types ---

export const MessageType = {
  CHAT: 'CHAT',
  JOIN: 'JOIN',
  LEAVE: 'LEAVE',
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];

export interface ChatMessageResponse {
  type: MessageType;
  content: string;
  sender: string;
  timestamp: string; // Received as an ISO date string
}

export interface SendChatMessageRequest {
  content: string;
  boardId: number;
}


// --- New Board Action Types ---

export const ActionType = {
    OBJECT_ADD: 'OBJECT_ADD',
    OBJECT_UPDATE: 'OBJECT_UPDATE',
    OBJECT_DELETE: 'OBJECT_DELETE',
} as const;

export type ActionType = typeof ActionType[keyof typeof ActionType];

// For actions sent FROM the client TO the server
export interface SendBoardActionRequest {
    boardId: number;
    type: ActionType;
    payload: unknown;
    instanceId: string;
}

// For actions received FROM the server
export interface BoardActionResponse {
    type: ActionType;
    payload: unknown;
    sender: string;
    instanceId: string;
}