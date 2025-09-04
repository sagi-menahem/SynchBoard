import { useAuth } from 'features/auth/hooks';
import { useChatMessages } from 'features/chat/hooks';
import type { EnhancedChatMessage } from 'features/chat/types/ChatTypes';
import type { ChatMessageResponse } from 'features/chat/types/MessageTypes';
import { useUserBoardPreferences } from 'features/settings/UserBoardPreferencesProvider';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CHAT_BACKGROUND_OPTIONS } from 'shared/constants';
import { TIMING_CONSTANTS } from 'shared/constants/TimingConstants';
import logger from 'shared/utils/logger';

/**
 * Properties for the useChatWindowLogic hook defining board context and message data.
 */
interface UseChatWindowLogicProps {
  /** Board identifier for associating chat with specific board context */
  boardId: number;
  /** Array of chat messages to display and manage in the window */
  messages: ChatMessageResponse[];
}

/**
 * Custom hook for managing chat window state, interactions, and UI logic.
 * Provides comprehensive chat functionality including message handling, search capabilities,
 * automatic scrolling, keyboard shortcuts, and visual feedback for real-time messaging.
 * Integrates with board context for optimistic updates and transaction-based message management.
 * 
 * Key features:
 * - Message state management with optimistic updates and pending indicators
 * - Search functionality with keyboard shortcuts (Ctrl/Cmd+F)
 * - Automatic scroll-to-bottom behavior for new messages
 * - Message grouping and date separation logic
 * - Background styling based on user preferences
 * - Transaction-based message tracking for conflict resolution
 * - Integration with WebSocket service for real-time updates
 * - Keyboard event handling for enhanced user experience
 * 
 * @param boardId - Board identifier for chat context and message association
 * @param messages - Array of chat messages to display and manage
 * @returns Object containing chat window state, handlers, and UI utilities
 */
export const useChatWindowLogic = ({ boardId, messages }: UseChatWindowLogicProps) => {
  const { preferences } = useUserBoardPreferences();
  const { userEmail } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());
  const [pendingMessageIds, setPendingMessageIds] = useState<Set<string>>(new Set());

  const { sendMessage } = useChatMessages();

  // Memoized to prevent unnecessary re-renders when adding optimistic messages
  const addOptimisticMessage = useCallback(
    (message: ChatMessageResponse & { transactionId: string }) => {
      const messageKey = message.transactionId ?? `${message.instanceId}-${message.timestamp}`;
      setNewMessageIds((prev) => new Set([...prev, messageKey]));

      if (message.instanceId) {
        setPendingMessageIds((prev) => new Set([...prev, message.instanceId!]));

        setTimeout(() => {
          setPendingMessageIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(message.instanceId!);
            return newSet;
          });

          setNewMessageIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(messageKey);
            return newSet;
          });
        }, TIMING_CONSTANTS.CHAT_PENDING_MESSAGE_TIMEOUT);
      }
    },
    [],
  );

  // Memoized to provide stable function reference for pending timer operations
  const startPendingTimer = useCallback((_transactionId: string) => {}, []);

  // Memoized to prevent unnecessary re-renders when scrolling chat to bottom
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

  // Manages keyboard event listeners for chat search functionality
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

  const sendChatMessage = async (content: string) => {
    const userInfo = {
      userEmail: userEmail ?? '',
      userFullName: '',
      userProfilePictureUrl: undefined,
    };

    return await sendMessage(
      content,
      boardId,
      userEmail,
      userInfo,
      addOptimisticMessage,
      startPendingTimer,
    );
  };

  // Memoized to avoid recalculating enhanced messages when pending states haven't changed
  const allMessages = useMemo((): EnhancedChatMessage[] => {
    return messages.map((msg): EnhancedChatMessage => {
      const enhancedMsg = msg as EnhancedChatMessage;

      const isPending = msg.instanceId && pendingMessageIds.has(msg.instanceId);
      const status = isPending ? 'pending' : 'confirmed';

      return {
        ...enhancedMsg,
        transactionStatus: status,
      };
    });
  }, [messages, pendingMessageIds]);

  // Handles automatic scrolling when new messages arrive
  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, TIMING_CONSTANTS.CHAT_SCROLL_DELAY);
    if (allMessages.length !== previousMessageCount) {
      setPreviousMessageCount(allMessages.length);
    }
    return () => clearTimeout(timeoutId);
  }, [allMessages, scrollToBottom, previousMessageCount]);

  // Memoized to avoid recalculating filtered messages when search term or messages haven't changed
  const filteredMessages = useMemo(() => {
    if (!searchTerm.trim()) {
      return allMessages;
    }

    const lowercaseSearch = searchTerm.toLowerCase();
    return allMessages.filter(
      (msg) =>
        msg.content.toLowerCase().includes(lowercaseSearch) ||
        msg.senderEmail.toLowerCase().includes(lowercaseSearch),
    );
  }, [allMessages, searchTerm]);

  const handleSendMessage = async (content: string) => {
    if (!boardId) {
      return;
    }

    try {
      await sendChatMessage(content);
    } catch (error) {
      logger.error('Failed to send chat message via handler:', error);
    }
  };

  const shouldShowDateSeparator = (
    currentMsg: EnhancedChatMessage,
    prevMsg: EnhancedChatMessage | null,
  ): boolean => {
    if (!prevMsg) {
      return true;
    }
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

  const commitChatTransaction = useCallback((_instanceId: string) => {}, []);

  const handleSearchClose = () => {
    setSearchVisible(false);
    setSearchTerm('');
  };

  // Memoized to prevent unnecessary re-renders when checking message new status
  const isMessageNew = useCallback(
    (message: EnhancedChatMessage): boolean => {
      const messageKey = message.transactionId ?? `${message.instanceId}-${message.timestamp}`;
      return newMessageIds.has(messageKey);
    },
    [newMessageIds],
  );

  return {
    messagesEndRef,
    messagesContainerRef,

    searchTerm,
    setSearchTerm,
    searchVisible,
    setSearchVisible,
    previousMessageCount,

    filteredMessages,

    handleSendMessage,
    handleSearchClose,
    shouldShowDateSeparator,
    getBackgroundStyle,
    commitChatTransaction,
    isMessageNew,
  };
};
