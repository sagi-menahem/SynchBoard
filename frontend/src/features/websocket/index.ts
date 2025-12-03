/**
 * @fileoverview WebSocket feature module exports.
 * Provides context provider and types for real-time STOMP communication.
 */

export { WebSocketProvider } from './WebSocketProvider';

// Note: WebSocketService is no longer exported from barrel to enable lazy-loading
// Import directly from 'features/websocket/services/websocketService' when needed

export type * from './types/WebSocketTypes';
