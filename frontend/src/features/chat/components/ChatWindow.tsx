import React, { useCallback, useEffect, useMemo, useOptimistic, useRef, useState } from 'react';

import { useAuth } from 'features/auth/hooks';
import { useChatMessages } from 'features/chat/hooks';
import type { EnhancedChatMessage } from 'features/chat/types/ChatTypes';
import type { ChatMessageResponse } from 'features/chat/types/MessageTypes';
import { usePreferences } from 'features/settings/UserBoardPreferencesProvider';
import { useTranslation } from 'react-i18next';
import { CHAT_BACKGROUND_OPTIONS } from 'shared/constants';
import { createUserColorMap, type UserColorMap } from 'shared/utils';
import { formatDateSeparator } from 'shared/utils/DateUtils';


import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import styles from './ChatWindow.module.scss';

interface ChatWindowProps {
  boardId: number;
  messages: ChatMessageResponse[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ boardId, messages }) => {
  const { t } = useTranslation(['chat', 'common']);
  const { preferences } = usePreferences();
  const { userEmail } = useAuth();
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

  const { sendMessage } = useChatMessages();

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
    if (messages.length !== previousMessageCount) {
      setPreviousMessageCount(messages.length);
    }
    return () => clearTimeout(timeoutId);
  }, [messages, scrollToBottom, previousMessageCount]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey ?? e.metaKey) && e.key === 'f') {
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
    userEmail: userEmail ?? '',
    userFullName: '',
    userProfilePictureUrl: undefined,
  }), [userEmail]);

  const sendChatMessage = useCallback(async (content: string) => {
    return await sendMessage(content, boardId, userEmail, stableUserInfo, addOptimisticMessage);
  }, [sendMessage, boardId, userEmail, stableUserInfo, addOptimisticMessage]);

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
      logger.error('Failed to send chat message via handler:', error);
    }
  }, [sendChatMessage, boardId]);

  const shouldShowDateSeparator = (currentMsg: EnhancedChatMessage, prevMsg: EnhancedChatMessage | null): boolean => {
    if (!prevMsg) {return true;}
    const currentDate = new Date(currentMsg.timestamp).toDateString();
    const prevDate = new Date(prevMsg.timestamp).toDateString();
    return currentDate !== prevDate;
  };

  const getBackgroundStyle = () => {
    const savedColor = preferences.boardBackgroundSetting;
    if (!savedColor) {
      return {};
    }
    
    const backgroundOption = CHAT_BACKGROUND_OPTIONS.find((option) => option.color === savedColor);
    if (backgroundOption?.cssVar) {
      return { backgroundColor: `var(${backgroundOption.cssVar})` };
    }
    
    return { backgroundColor: savedColor };
  };

  return (
    <div
      className={styles.container}
      style={getBackgroundStyle()}
    >
      {searchVisible && (
        <div className={styles.searchContainer}>
          <input
            id="chat-search-input"
            name="chatSearch"
            type="text"
            placeholder={t('chat:searchPlaceholder')}
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
          const isNewMessage = index >= previousMessageCount;
          
          return (
            <React.Fragment key={message.transactionId ?? `${message.senderEmail}-${message.timestamp}-${index}`}>
              {shouldShowDateSeparator(message, filteredMessages[index - 1] ?? null) && (
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
        placeholder={t('chat:window.placeholder')}
      />
    </div>
  );
};

export default ChatWindow;