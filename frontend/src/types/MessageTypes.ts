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
    instanceId?: string; // Added: Server echoes back the transaction ID for message matching
}

export interface SendChatMessageRequest {
    content: string;
    boardId: number;
    instanceId?: string; // Added: Client-side transaction ID for message tracking
}