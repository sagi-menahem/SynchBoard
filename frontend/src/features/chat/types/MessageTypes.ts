export const MessageType = {
  CHAT: 'CHAT',
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export interface ChatMessageResponse {
  id: number;
  type: MessageType;
  content: string;
  timestamp: string;
  senderEmail: string;
  senderFullName: string;
  senderProfilePictureUrl: string | null;
  instanceId?: string;
}
