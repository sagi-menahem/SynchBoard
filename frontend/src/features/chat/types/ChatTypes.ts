import type { ChatMessageResponse } from './MessageTypes';

/**
 * Enhanced chat message interface extending base message with transaction tracking capabilities.
 * Provides optimistic update support and status indicators for real-time messaging experience.
 * Used for managing message delivery states and conflict resolution in collaborative environments.
 */
export interface EnhancedChatMessage extends ChatMessageResponse {
  /** Unique transaction identifier for optimistic updates and message tracking */
  transactionId?: string;
  /** Current transaction status for visual feedback on message delivery state */
  transactionStatus?: 'pending' | 'confirmed' | 'failed';
}
