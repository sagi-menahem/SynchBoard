// Virtualized Chat Window - Future implementation for performance with large message lists
// Currently exports the standard ChatWindow for compatibility

import React from 'react';
import ChatWindow from './ChatWindow';
import type { ChatMessageResponse } from 'types/MessageTypes';

interface VirtualizedChatWindowProps {
  boardId: number;
  messages: ChatMessageResponse[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageResponse[]>>;
}

/**
 * Placeholder for virtualized chat window - currently forwards to standard ChatWindow
 * TODO: Implement proper virtualization when chat APIs are stabilized
 */
const VirtualizedChatWindow: React.FC<VirtualizedChatWindowProps> = (props) => {
  return <ChatWindow {...props} />;
};

export default VirtualizedChatWindow;