import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { formatDateSeparator } from 'utils/DateUtils';

import { useAuth } from 'hooks/auth';
import { useChatTransaction } from 'hooks/chat';
import { usePreferences, useSocket } from 'hooks/common';
import type { EnhancedChatMessage } from 'types/ChatTypes';
import type { ChatMessageResponse } from 'types/MessageTypes';

import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
  boardId: number;
  messages: ChatMessageResponse[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageResponse[]>>;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ boardId, messages, setMessages }) => {
  const { t } = useTranslation();
  const { preferences } = usePreferences();
  const { userEmail } = useAuth();
  const {} = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);

  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    const endElement = messagesEndRef.current;
    
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
    
    if (endElement) {
      endElement.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, scrollToBottom]);

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

  const stableUserInfo = useMemo(() => ({
    userEmail: userEmail || '',
    userFullName: '',
    userProfilePictureUrl: undefined,
  }), [userEmail]);

  const { sendChatMessage, allMessages } = useChatTransaction({
    boardId,
    messages,
    setMessages,
    ...stableUserInfo,
  });

  const filteredMessages = useMemo(() => {
    if (!searchTerm.trim()) {
      return allMessages;
    }
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return allMessages.filter((msg) => 
      msg.content.toLowerCase().includes(lowercaseSearch) ||
      msg.senderFullName.toLowerCase().includes(lowercaseSearch),
    );
  }, [allMessages, searchTerm]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!boardId) {
      return;
    }

    try {
      await sendChatMessage(content);
    } catch (error) {
      console.error('Failed to send chat message:', error);
    }
  }, [sendChatMessage, boardId]);

  const shouldShowDateSeparator = useCallback(
    (currentMsg: EnhancedChatMessage, prevMsg: EnhancedChatMessage | null): boolean => {
      if (!prevMsg) return true;
      const currentDate = new Date(currentMsg.timestamp).toDateString();
      const prevDate = new Date(prevMsg.timestamp).toDateString();
      return currentDate !== prevDate;
    },
    [],
  );

  return (
    <div
      className={styles.container}
      style={{ backgroundColor: preferences.chatBackgroundSetting || undefined }}
    >
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