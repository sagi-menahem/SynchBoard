// File: frontend/src/types/message.types.ts
export const MessageType = {
    CHAT: 'CHAT',
    JOIN: 'JOIN',
    LEAVE: 'LEAVE',
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export interface ChatMessageResponse {
    type: MessageType;
    content: string;
    timestamp: string;
    senderEmail: string;
    senderFullName: string;
    senderProfilePictureUrl: string | null;
}

export interface SendChatMessageRequest {
    content: string;
    boardId: number;
}
