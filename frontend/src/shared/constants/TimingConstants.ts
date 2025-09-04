/**
 * Timing and delay constants for the SynchBoard application.
 * Defines millisecond values for various time-sensitive operations including chat message handling,
 * WebSocket connection timeouts, UI transitions, error recovery delays, and periodic update intervals.
 * These values are tuned for optimal user experience and system performance.
 */

export const TIMING_CONSTANTS = {
  CHAT_PENDING_MESSAGE_TIMEOUT: 750,
  CHAT_SCROLL_DELAY: 100,
  CHAT_MESSAGE_GROUPING_WINDOW: 300000,

  WEBSOCKET_CONNECTION_TIMEOUT: 10000,

  THEME_CHANGE_DETECTION_TIMEOUT: 5000,

  ERROR_RECOVERY_DELAY: 500,

  CONNECTION_STATUS_MEASUREMENT_DELAY: 100,

  TIMESTAMP_UPDATE_INTERVAL: 55000,
} as const;
