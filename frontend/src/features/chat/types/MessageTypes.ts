/** Message type constants for WebSocket communication and message categorization */
export const MessageType = {
  CHAT: 'CHAT',
} as const;

/** Union type derived from MessageType constants for type safety */
export type MessageType = (typeof MessageType)[keyof typeof MessageType];

/**
 * Chat message response interface representing server-side message structure.
 * Contains all necessary information for message display, sender identification,
 * and real-time synchronization across connected clients.
 */
export interface ChatMessageResponse {
  /** Unique server-generated message identifier for database persistence */
  id: number;
  /** Message type identifier for routing and handling different message categories */
  type: MessageType;
  /** Text content of the chat message, sanitized for security */
  content: string;
  /** ISO timestamp string indicating when the message was created */
  timestamp: string;
  /** Email address of the message sender for identity verification */
  senderEmail: string;
  /** Full display name of the sender for UI presentation */
  senderFullName: string;
  /** Optional profile picture URL for sender avatar display */
  senderProfilePictureUrl: string | null;
  /** Optional instance identifier for optimistic updates and deduplication */
  instanceId?: string;
}
