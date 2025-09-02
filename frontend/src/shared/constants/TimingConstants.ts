export const TIMING_CONSTANTS = {
  // Chat message timing
  CHAT_PENDING_MESSAGE_TIMEOUT: 750,
  CHAT_SCROLL_DELAY: 100,
  
  // WebSocket connection timeout  
  WEBSOCKET_CONNECTION_TIMEOUT: 10000,
  
  // Theme change detection
  THEME_CHANGE_DETECTION_TIMEOUT: 5000,
  
  // Error boundary recovery delay
  ERROR_RECOVERY_DELAY: 500,
  
  // Connection status measurement delay
  CONNECTION_STATUS_MEASUREMENT_DELAY: 100,
} as const;