import { useAuth } from 'features/auth/hooks';
import { useChatMessages } from 'features/chat/hooks';
import type { EnhancedChatMessage } from 'features/chat/types/ChatTypes';
import type { ChatMessageResponse } from 'features/chat/types/MessageTypes';
import { useUserBoardPreferences } from 'features/settings/UserBoardPreferencesProvider';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CHAT_BACKGROUND_OPTIONS } from 'shared/constants';
import { TIMING_CONSTANTS } from 'shared/constants/TimingConstants';
import logger from 'shared/utils/logger';

interface UseChatWindowLogicProps {
  boardId: number;
  messages: ChatMessageResponse[];
}

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

  const startPendingTimer = useCallback((_transactionId: string) => {}, []);

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

  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, TIMING_CONSTANTS.CHAT_SCROLL_DELAY);
    if (allMessages.length !== previousMessageCount) {
      setPreviousMessageCount(allMessages.length);
    }
    return () => clearTimeout(timeoutId);
  }, [allMessages, scrollToBottom, previousMessageCount]);

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
