import type { ChatMessageResponse } from './MessageTypes';

export interface EnhancedChatMessage extends ChatMessageResponse {
  // Simple transaction tracking
  transactionId?: string;
  transactionStatus?: 'pending' | 'confirmed' | 'failed';
}

export interface ChatTransactionConfig {
  boardId: number;
  userEmail: string;
  userFullName: string;
  userProfilePictureUrl?: string;
  messages: ChatMessageResponse[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageResponse[]>>;
}