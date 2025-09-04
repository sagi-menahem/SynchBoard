/**
 * Data transfer object for board-level WebSocket update notifications.
 * Represents changes to board metadata, membership, or canvas state that should
 * be broadcast to all connected board participants for real-time synchronization.
 */
export interface BoardUpdateDTO {
  // Type of board update to determine appropriate client-side handling
  updateType: 'DETAILS_UPDATED' | 'MEMBERS_UPDATED' | 'CANVAS_UPDATED';
  // Email of user who initiated the change for filtering self-updates
  sourceUserEmail: string;
}

/**
 * Data transfer object for user-specific WebSocket update notifications.
 * Represents changes to user's board access, preferences, or global settings
 * that should be sent to specific user's private queue for personalized updates.
 */
export interface UserUpdateDTO {
  // Type of user-specific update to determine client-side response
  updateType: 'BOARD_LIST_CHANGED' | 'BOARD_DETAILS_CHANGED' | 'CANVAS_SETTINGS_CHANGED';
  // Optional board identifier for board-specific user updates
  boardId?: number;
}
