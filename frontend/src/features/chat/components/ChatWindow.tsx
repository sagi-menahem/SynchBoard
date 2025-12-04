import { useAuth } from 'features/auth/hooks';
import { useBoardContext } from 'features/board/hooks/context/useBoardContext';
import { useChatWindowLogic } from 'features/chat/hooks/useChatWindowLogic';
import type { ChatMessageResponse } from 'features/chat/types/MessageTypes';
import React, { useEffect, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { TIMING_CONSTANTS } from 'shared/constants/TimingConstants';
import { Button, Card } from 'shared/ui';
import { formatDateSeparator } from 'shared/utils/DateUtils';

import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import styles from './ChatWindow.module.scss';

/**
 * Imperative handle for ChatWindow to allow parent components to trigger actions.
 */
export interface ChatWindowHandle {
  /** Scrolls the message list to the bottom */
  scrollToBottom: () => void;
}

/**
 * Properties for the ChatWindow component defining board association and message data.
 */
interface ChatWindowProps {
  /** Board identifier for associating chat with specific board context */
  boardId: number;
  /** Array of chat messages to display and manage in the window */
  messages: ChatMessageResponse[];
  /** Whether this chat window is rendered inside a mobile drawer (affects focus behavior) */
  isMobileDrawer?: boolean;
  /** Optional ref to expose imperative methods like scrollToBottom */
  chatRef?: React.Ref<ChatWindowHandle>;
}

/**
 * Main chat window component providing real-time messaging interface for board collaboration.
 * Integrates with board context for WebSocket message handling, implements message grouping,
 * search functionality, and automatic scrolling behavior. Manages chat state and optimistic
 * updates for seamless real-time communication experience.
 *
 * Key features:
 * - Real-time message display with WebSocket integration
 * - Message grouping for consecutive messages from the same sender
 * - Search functionality with result filtering and highlighting
 * - Automatic scrolling to newest messages with smooth behavior
 * - Date separators for better message organization
 * - Optimistic message updates with transaction-based conflict resolution
 * - Message animation control for performance optimization
 * - Integration with board context for unified state management
 *
 * @param boardId - Board identifier for chat context
 * @param messages - Array of chat messages to display
 */
const ChatWindow: React.FC<ChatWindowProps> = ({
  boardId,
  messages,
  isMobileDrawer = false,
  chatRef,
}) => {
  const { t } = useTranslation(['chat', 'common']);
  const { userEmail } = useAuth();
  const { registerChatCommitHandler } = useBoardContext();

  // Hook providing all chat window logic and state management
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
    scrollToBottom,
  } = useChatWindowLogic({ boardId, messages, isMobileDrawer });

  // Expose scrollToBottom to parent components via ref
  useImperativeHandle(
    chatRef,
    () => ({
      scrollToBottom,
    }),
    [scrollToBottom],
  );

  // Register chat transaction handler with board context for WebSocket integration
  useEffect(() => {
    registerChatCommitHandler(commitChatTransaction);

    return () => {
      registerChatCommitHandler(null);
    };
  }, [registerChatCommitHandler, commitChatTransaction]);

  return (
    <Card className={styles.container} padding="none">
      {/* Search interface shown when search is active */}
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
            aria-label={t('chat:searchPlaceholder')}
          />
          <Button
            variant="icon"
            onClick={handleSearchClose}
            className={styles.searchCloseButton}
            aria-label={t('common:close')}
          >
            ✕
          </Button>
          {searchTerm && (
            <div className={styles.searchResults}>{filteredMessages.length} results</div>
          )}
        </div>
      )}

      <div className={styles.messageList} ref={messagesContainerRef}>
        {filteredMessages.map((message, index) => {
          // Disable animation on mobile drawer to prevent layout jumps with keyboard
          const shouldAnimate = !isMobileDrawer && isMessageNew(message);
          const prevMessage = filteredMessages[index - 1] ?? null;

          // Complex message grouping logic: consecutive messages from same user within time window receive visual grouping
          const isGroupedWithPrevious =
            prevMessage &&
            prevMessage.senderEmail === message.senderEmail &&
            !shouldShowDateSeparator(message, prevMessage) &&
            new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() <
              TIMING_CONSTANTS.CHAT_MESSAGE_GROUPING_WINDOW; // Time window for grouping related messages together

          return (
            <React.Fragment key={message.instanceId ?? `${message.id}-${message.timestamp}`}>
              {/* Show date separator when messages are from different days */}
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
        {/* Scroll anchor for automatic scrolling to newest messages */}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        placeholder={t('chat:window.placeholder')}
        disableAutoFocus={isMobileDrawer}
      />
    </Card>
  );
};

export default ChatWindow;
