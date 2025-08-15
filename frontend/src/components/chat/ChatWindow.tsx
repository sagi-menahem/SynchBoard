import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { useAuth } from 'hooks/auth';
import { useChatTransaction } from 'hooks/chat';
import { usePreferences } from 'hooks/common';
import { formatDateSeparator } from 'utils/DateUtils';
import type { ChatMessageResponse } from 'types/MessageTypes';
import type { EnhancedChatMessage } from 'types/ChatTypes';

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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Search functionality state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);

  const scrollToBottom = useCallback(() => {
    // Enhanced auto-scroll with both container and end element
    const container = messagesContainerRef.current;
    const endElement = messagesEndRef.current;
    
    if (container) {
      // Direct scroll to bottom for immediate effect
      container.scrollTop = container.scrollHeight;
    }
    
    if (endElement) {
      // Smooth scroll for visual appeal
      endElement.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100); // Small delay for DOM updates
    return () => clearTimeout(timeoutId);
  }, [messages, scrollToBottom]);

  // Keyboard shortcut for search (Ctrl+F or Cmd+F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setSearchVisible(true);
      }
      if (e.key === 'Escape') {
        setSearchVisible(false);
        setSearchTerm('');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Filter messages based on search term
  const filteredMessages = useMemo(() => {
    if (!searchTerm.trim()) {
      return allMessages;
    }
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return allMessages.filter(msg => 
      msg.content.toLowerCase().includes(lowercaseSearch) ||
      msg.senderFullName.toLowerCase().includes(lowercaseSearch)
    );
  }, [allMessages, searchTerm]);

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

  // Helper function to check if should show date separator
  const shouldShowDateSeparator = useCallback((currentMsg: EnhancedChatMessage, prevMsg: EnhancedChatMessage | null): boolean => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.timestamp).toDateString();
    const prevDate = new Date(prevMsg.timestamp).toDateString();
    return currentDate !== prevDate;
  }, []);

  const fontSizeClass = styles[`fontSize-${preferences.fontSizeSetting || 'medium'}`];

  return (
    <div
      className={`${styles.container} ${fontSizeClass}`}
      style={{ backgroundColor: preferences.chatBackgroundSetting || undefined }}
    >
      {/* Search Interface */}
      {searchVisible && (
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            autoFocus
          />
          <button
            onClick={() => {
              setSearchVisible(false);
              setSearchTerm('');
            }}
            className={styles.searchCloseButton}
          >
            ✕
          </button>
          {searchTerm && (
            <div className={styles.searchResults}>
              {filteredMessages.length} results
            </div>
          )}
        </div>
      )}
      
      <div className={styles.messageList} ref={messagesContainerRef}>
        {filteredMessages.map((message, index) => (
          <React.Fragment key={message.transactionId || `${message.senderEmail}-${message.timestamp}-${index}`}>
            {shouldShowDateSeparator(message, filteredMessages[index - 1] || null) && (
              <div className={styles.dateSeparator}>
                {formatDateSeparator(message.timestamp)}
              </div>
            )}
            <ChatMessage 
              message={message} 
              isOwnMessage={message.senderEmail === userEmail}
            />
          </React.Fragment>
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