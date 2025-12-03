/**
 * @fileoverview Chat feature module exports.
 * Provides components, hooks, and types for real-time board chat functionality.
 */

export { default as ChatMessage } from './components/ChatMessage';
export { default as ChatWindow } from './components/ChatWindow';

export { useChatMessages } from './hooks';

export type * from './types/ChatTypes';
export type * from './types/MessageTypes';
