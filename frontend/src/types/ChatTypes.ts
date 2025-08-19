import type { ChatMessageResponse } from './MessageTypes';

export interface EnhancedChatMessage extends ChatMessageResponse {
  // Transaction tracking
  transactionId?: string;
  transactionStatus?: 'sending' | 'processing' | 'confirmed' | 'failed';
  
  // Queue-specific metadata
  queuePosition?: number;
  retryCount?: number;
  failureReason?: string;
}

export interface ChatTransactionConfig {
  boardId: number;
  userEmail: string;
  userFullName: string;
  userProfilePictureUrl?: string;
  messages: ChatMessageResponse[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageResponse[]>>;
}