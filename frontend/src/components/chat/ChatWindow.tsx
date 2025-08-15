import React, { useEffect, useRef, useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { useAuth } from 'hooks/auth';
import { useChatTransaction } from 'hooks/chat';
import { usePreferences } from 'hooks/common';
import type { ChatMessageResponse } from 'types/MessageTypes';

import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
  boardId: number;
  messages: ChatMessageResponse[];
  /** Function to update the messages state from parent component */
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageResponse[]>>;
}

/**
 * Enhanced ChatWindow component with transactional messaging support and offline queueing
 * 
 * Features:
 * - Optimistic message updates (messages appear immediately)
 * - Offline message queueing (messages preserved during outages)
 * - Smart status indicators with opacity-based feedback
 * - Automatic rollback on connection failures
 * - Robust error handling with user feedback
 * - Smooth animations and enhanced UX
 */
const ChatWindow: React.FC<ChatWindowProps> = ({ boardId, messages, setMessages }) => {
  const { t } = useTranslation();
  const { preferences } = usePreferences();
  const { userEmail } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  // Memoize user info to prevent unnecessary re-renders
  const stableUserInfo = useMemo(() => ({
    userEmail: userEmail || '',
    userFullName: '', // Will be filled by the backend from user profile
    userProfilePictureUrl: undefined,
  }), [userEmail]);

  // Use the enhanced chat transaction hook
  const { sendChatMessage, allMessages } = useChatTransaction({
    boardId,
    messages,
    setMessages,
    ...stableUserInfo,
  });

  // Optimized callback for ChatInput component - memoized to prevent re-renders
  const handleSendMessage = useCallback(async (content: string) => {
    if (!boardId) {
      return;
    }

    try {
      await sendChatMessage(content);
    } catch (error) {
      // Error handling is done by the transaction hook
      console.error('Failed to send chat message:', error);
    }
  }, [sendChatMessage, boardId]);

  const fontSizeClass = styles[`fontSize-${preferences.fontSizeSetting || 'medium'}`];

  return (
    <div
      className={`${styles.container} ${fontSizeClass}`}
      style={{ backgroundColor: preferences.chatBackgroundSetting || undefined }}
    >
      <div className={styles.messageList}>
        {allMessages.map((msg, index) => (
          <ChatMessage 
            key={msg.transactionId || `${msg.senderEmail}-${msg.timestamp}-${index}`}
            message={msg} 
            isOwnMessage={msg.senderEmail === userEmail}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        placeholder={t('chatWindow.placeholder')}
      />
    </div>
  );
};

export default ChatWindow;