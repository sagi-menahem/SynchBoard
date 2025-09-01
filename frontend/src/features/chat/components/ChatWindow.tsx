import React from 'react';

import { useAuth } from 'features/auth/hooks';
import { useChatWindowLogic } from 'features/chat/hooks/useChatWindowLogic';
import type { ChatMessageResponse } from 'features/chat/types/MessageTypes';
import { useTranslation } from 'react-i18next';
import { Button, Card } from 'shared/ui';
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
  const { userEmail } = useAuth();
  
  const {
    messagesEndRef,
    messagesContainerRef,
    searchTerm,
    setSearchTerm,
    searchVisible,
    previousMessageCount,
    userColorMap,
    filteredMessages,
    handleSendMessage,
    handleSearchClose,
    shouldShowDateSeparator,
  } = useChatWindowLogic({ boardId, messages });

  return (
    <Card
      className={styles.container}
      padding="none"
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
          <Button
            variant="icon"
            onClick={handleSearchClose}
            className={styles.searchCloseButton}
          >
            ✕
          </Button>
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
    </Card>
  );
};

export default ChatWindow;