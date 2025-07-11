// File: frontend/src/types/websocket.types.ts

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
  timestamp: string;
}

export interface SendChatMessageRequest {
  content: string;
  boardId: number;
}

export const ActionType = {
    OBJECT_ADD: 'OBJECT_ADD',
    OBJECT_UPDATE: 'OBJECT_UPDATE',
    OBJECT_DELETE: 'OBJECT_DELETE',
} as const;

export type ActionType = typeof ActionType[keyof typeof ActionType];

export interface SendBoardActionRequest {
    boardId: number;
    type: ActionType;
    payload: unknown;
    instanceId: string;
}

export interface BoardActionResponse {
    type: ActionType;
    payload: unknown;
    sender: string;
    instanceId: string;
}