import type { ChatMessageResponse } from './MessageTypes';

export interface EnhancedChatMessage extends ChatMessageResponse {
  transactionId?: string;
  transactionStatus?: 'pending' | 'confirmed' | 'failed';
}

