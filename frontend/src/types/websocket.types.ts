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
  timestamp: string; // Received as an ISO date string
}

export interface SendChatMessageRequest {
  content: string;
  boardId: number;
}