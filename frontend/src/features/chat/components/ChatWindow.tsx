import { useAuth } from 'features/auth/hooks';
import { useBoardContext } from 'features/board/hooks/context/useBoardContext';
import { useChatWindowLogic } from 'features/chat/hooks/useChatWindowLogic';
import type { ChatMessageResponse } from 'features/chat/types/MessageTypes';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TIMING_CONSTANTS } from 'shared/constants/TimingConstants';
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
  const { registerChatCommitHandler } = useBoardContext();

  const {
    messagesEndRef,
    messagesContainerRef,
    searchTerm,
    setSearchTerm,
    searchVisible,
    filteredMessages,
    handleSendMessage,
    handleSearchClose,
    shouldShowDateSeparator,
    commitChatTransaction,
    isMessageNew,
  } = useChatWindowLogic({ boardId, messages });

  useEffect(() => {
    registerChatCommitHandler(commitChatTransaction);

    return () => {
      registerChatCommitHandler(null);
    };
  }, [registerChatCommitHandler, commitChatTransaction]);

  return (
    <Card className={styles.container} padding="none">
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
          <Button variant="icon" onClick={handleSearchClose} className={styles.searchCloseButton}>
            ✕
          </Button>
          {searchTerm && (
            <div className={styles.searchResults}>{filteredMessages.length} results</div>
          )}
        </div>
      )}

      <div className={styles.messageList} ref={messagesContainerRef}>
        {filteredMessages.map((message, index) => {
          const shouldAnimate = isMessageNew(message);
          const prevMessage = filteredMessages[index - 1] ?? null;

          const isGroupedWithPrevious =
            prevMessage &&
            prevMessage.senderEmail === message.senderEmail &&
            !shouldShowDateSeparator(message, prevMessage) &&
            new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() <
              TIMING_CONSTANTS.CHAT_MESSAGE_GROUPING_WINDOW;

          return (
            <React.Fragment key={message.instanceId ?? `${message.id}-${message.timestamp}`}>
              {shouldShowDateSeparator(message, prevMessage) && (
                <div className={styles.dateSeparator}>{formatDateSeparator(message.timestamp)}</div>
              )}
              <ChatMessage
                message={message}
                isOwnMessage={message.senderEmail === userEmail}
                shouldAnimate={shouldAnimate}
                isGrouped={isGroupedWithPrevious}
              />
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={handleSendMessage} placeholder={t('chat:window.placeholder')} />
    </Card>
  );
};

export default ChatWindow;
