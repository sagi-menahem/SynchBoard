import React, { startTransition, useCallback, useEffect, useMemo, useOptimistic, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { WebSocketService } from 'services';
import { createUserColorMap, Logger, type UserColorMap } from 'utils';
import { formatDateSeparator } from 'utils/DateUtils';

import { WEBSOCKET_DESTINATIONS } from 'constants/ApiConstants';
import { useAuth } from 'hooks/auth';
import { usePreferences } from 'hooks/common';
import { useSocket } from 'hooks/common/useSocket';
import type { EnhancedChatMessage } from 'types/ChatTypes';
import type { ChatMessageResponse } from 'types/MessageTypes';

import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
  boardId: number;
  messages: ChatMessageResponse[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ boardId, messages }) => {
  const { t } = useTranslation();
  const { preferences } = usePreferences();
  const { userEmail } = useAuth();
  const {} = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  
  const [userColorMap] = useState<UserColorMap>(() => createUserColorMap());

  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage: ChatMessageResponse) => [...state, newMessage],
  );

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
    // Track if message count changed (new messages received)
    if (messages.length !== previousMessageCount) {
      setPreviousMessageCount(messages.length);
    }
    return () => clearTimeout(timeoutId);
  }, [messages, scrollToBottom, previousMessageCount]);

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

  const sendChatMessage = useCallback(async (content: string) => {
    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      throw new Error(t('chat.emptyMessage'));
    }

    if (trimmedContent.length > 5000) {
      throw new Error(t('chat.messageTooLong'));
    }

    const instanceId = crypto.randomUUID();
    const payload = {
      type: 'CHAT',
      content: trimmedContent,
      timestamp: Date.now(),
      instanceId,
      boardId: boardId,
      senderEmail: userEmail,
      senderFullName: stableUserInfo.userFullName,
      senderProfilePictureUrl: stableUserInfo.userProfilePictureUrl || null,
    };

    const optimisticMessage: ChatMessageResponse & { transactionId: string } = {
      id: -1,
      type: 'CHAT',
      content: trimmedContent,
      timestamp: new Date().toISOString(),
      senderEmail: userEmail || '',
      senderFullName: stableUserInfo.userFullName,
      senderProfilePictureUrl: stableUserInfo.userProfilePictureUrl || null,
      instanceId,
      transactionId: instanceId,
    };
    
    startTransition(() => {
      addOptimisticMessage(optimisticMessage);
    });

    try {
      WebSocketService.sendMessage(WEBSOCKET_DESTINATIONS.SEND_MESSAGE, payload);
      return instanceId;
    } catch (error) {
      Logger.error('Failed to send chat message:', error);
      throw error;
    }
  }, [userEmail, stableUserInfo, boardId, addOptimisticMessage, t]);

  const allMessages = useMemo((): EnhancedChatMessage[] => {
    return optimisticMessages.map((msg): EnhancedChatMessage => {
      const enhancedMsg = msg as EnhancedChatMessage;
      const hasTransactionId = 'transactionId' in enhancedMsg && enhancedMsg.transactionId;
      
      if (hasTransactionId) {
        const hasServerConfirmation = enhancedMsg.id && enhancedMsg.id > 0;
        return {
          ...enhancedMsg,
          transactionStatus: hasServerConfirmation ? 'confirmed' : 'pending',
        };
      }
      
      return {
        ...enhancedMsg,
        transactionStatus: 'confirmed',
      };
    });
  }, [optimisticMessages]);

  const filteredMessages = useMemo(() => {
    if (!searchTerm.trim()) {
      return allMessages;
    }
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return allMessages.filter((msg) => 
      msg.content.toLowerCase().includes(lowercaseSearch) ||
      msg.senderEmail.toLowerCase().includes(lowercaseSearch),
    );
  }, [allMessages, searchTerm]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!boardId) {
      return;
    }

    try {
      await sendChatMessage(content);
    } catch (error) {
      Logger.error('Failed to send chat message via handler:', error);
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
      style={{ backgroundColor: preferences.boardBackgroundSetting || undefined }}
    >
      {searchVisible && (
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder={t('chat.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
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
        {filteredMessages.map((message, index) => {
          // Check if this message is genuinely new (not just a timestamp update)
          const isNewMessage = index >= previousMessageCount;
          
          return (
            <React.Fragment key={message.transactionId || `${message.senderEmail}-${message.timestamp}-${index}`}>
              {shouldShowDateSeparator(message, filteredMessages[index - 1] || null) && (
                <div className={styles.dateSeparator}>
                  {formatDateSeparator(message.timestamp)}
                </div>
              )}
              <ChatMessage 
                message={message} 
                isOwnMessage={message.senderEmail === userEmail}
                userColorMap={userColorMap}
                shouldAnimate={isNewMessage}
              />
            </React.Fragment>
          );
        })}
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