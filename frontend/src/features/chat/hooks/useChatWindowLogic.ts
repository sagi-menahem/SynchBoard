import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from 'features/auth/hooks';
import { useChatMessages } from 'features/chat/hooks';
import type { EnhancedChatMessage } from 'features/chat/types/ChatTypes';
import type { ChatMessageResponse } from 'features/chat/types/MessageTypes';
import { useUserBoardPreferences } from 'features/settings/UserBoardPreferencesProvider';
import { CHAT_BACKGROUND_OPTIONS } from 'shared/constants';
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
  
  // 🎯 SOLUTION: Separate state management for optimistic messages
  const [forcePendingMessages, setForcePendingMessages] = useState<Set<string>>(new Set());
  const [optimisticMessages, setOptimisticMessages] = useState<(ChatMessageResponse & { transactionId: string })[]>([]);
  const pendingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingStartTimes = useRef<Map<string, number>>(new Map());
  
  // Minimum duration to show pending state (in milliseconds)
  const MINIMUM_PENDING_DURATION = 500; // 500ms minimum

  const { sendMessage } = useChatMessages();

  const addOptimisticMessage = useCallback((message: ChatMessageResponse & { transactionId: string }) => {
    console.log('🔄 [OPTIMISTIC] Adding message to optimistic state:', {
      messageId: message.id,
      instanceId: message.instanceId,
      transactionId: message.transactionId,
      isOptimistic: message.id === -1,
    });
    setOptimisticMessages((prev) => [...prev, message]);
  }, []);

  const startPendingTimer = useCallback((transactionId: string) => {
    const startTime = Date.now();
    pendingStartTimes.current.set(transactionId, startTime);
    
    console.log('⏰ [TIMER] Setting pending timer for:', transactionId, 'at', startTime);
    setForcePendingMessages((prev) => {
      const newSet = new Set([...prev, transactionId]);
      console.log('🔒 [TIMER] Force pending messages updated:', {
        transactionId,
        forcePendingCount: newSet.size,
        forcePendingList: Array.from(newSet),
      });
      return newSet;
    });
    
    const existingTimeout = pendingTimeouts.current.get(transactionId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    const timeout = setTimeout(() => {
      console.log('⏰ [TIMER] Timer expired for:', transactionId);
      setForcePendingMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(transactionId);
        console.log('🔓 [TIMER] Removing from force pending (timer expired):', {
          transactionId,
          remainingCount: newSet.size,
        });
        return newSet;
      });
      pendingTimeouts.current.delete(transactionId);
      pendingStartTimes.current.delete(transactionId);
    }, 800);
    
    pendingTimeouts.current.set(transactionId, timeout);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    const timeouts = pendingTimeouts.current;
    const startTimes = pendingStartTimes.current;
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
      timeouts.clear();
      startTimes.clear();
    };
  }, []);

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

  const sendChatMessage = async (content: string) => {
    const userInfo = {
      userEmail: userEmail ?? '',
      userFullName: '',
      userProfilePictureUrl: undefined,
    };
    
    return await sendMessage(content, boardId, userEmail, userInfo, addOptimisticMessage, startPendingTimer);
  };

  const allMessages = useMemo((): EnhancedChatMessage[] => {
    console.log('🗺 [MESSAGES] Processing separate message streams:', {
      serverMessagesCount: messages.length,
      optimisticMessagesCount: optimisticMessages.length,
      forcePendingCount: forcePendingMessages.size,
    });
    
    // Start with server messages (already confirmed)
    const combined: ChatMessageResponse[] = [...messages];
    
    // Add optimistic messages based on server confirmation and pending state
    optimisticMessages.forEach((optimistic) => {
      const hasServerVersion = messages.some((server) => 
        server.instanceId === optimistic.instanceId,
      );
      
      const isStillForcedPending = optimistic.transactionId && 
        forcePendingMessages.has(optimistic.transactionId);
      
      // Show optimistic message if either:
      // 1. No server version exists yet, OR
      // 2. Server version exists but message is still forced pending
      if (!hasServerVersion || isStillForcedPending) {
        const reason = !hasServerVersion ? 'no server version' : 'forced pending';
        console.log(`➕ [MESSAGES] Adding optimistic message (${reason}):`, {
          messageId: optimistic.id,
          instanceId: optimistic.instanceId,
          transactionId: optimistic.transactionId,
          hasServerVersion,
          isStillForcedPending,
        });
        combined.push(optimistic);
      } else {
        console.log('🔄 [MESSAGES] Skipping optimistic message (server confirmed & not forced pending):', {
          optimisticId: optimistic.id,
          instanceId: optimistic.instanceId,
          transactionId: optimistic.transactionId,
          hasServerVersion,
          isStillForcedPending,
        });
      }
    });
    
    // Sort by timestamp to maintain chronological order
    combined.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    console.log('🔄 [MESSAGES] Final combined messages:', {
      totalCount: combined.length,
      serverCount: messages.length,
      addedOptimisticCount: combined.length - messages.length,
    });
    
    return combined.map((msg, index): EnhancedChatMessage => {
      const enhancedMsg = msg as EnhancedChatMessage;
      const msgWithTransaction = msg as ChatMessageResponse & { transactionId?: string };
      const hasTransactionId = msgWithTransaction.transactionId;
      
      if (hasTransactionId) {
        const isForcedPending = forcePendingMessages.has(msgWithTransaction.transactionId!);
        const isOptimistic = enhancedMsg.id === -1;
        
        const status = (isForcedPending || isOptimistic) ? 'pending' : 'confirmed';
        
        console.log('⚒️ [MESSAGES] Status for transactional message:', {
          index,
          messageId: enhancedMsg.id,
          instanceId: enhancedMsg.instanceId,
          transactionId: msgWithTransaction.transactionId,
          isOptimistic,
          isForcedPending,
          calculatedStatus: status,
        });
        
        return {
          ...enhancedMsg,
          transactionStatus: status,
        };
      }
      
      console.log('✅ [MESSAGES] Server message (auto-confirmed):', {
        index,
        messageId: enhancedMsg.id,
        hasInstanceId: !!enhancedMsg.instanceId,
      });
      
      return {
        ...enhancedMsg,
        transactionStatus: 'confirmed',
      };
    });
  }, [messages, optimisticMessages, forcePendingMessages]);

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

  const performCleanup = useCallback((instanceId: string, reason: string) => {
    console.log(`🧹 [CLEANUP] Performing cleanup for ${instanceId} - ${reason}`);
    
    // Remove from forced pending
    setForcePendingMessages((prev) => {
      const newSet = new Set(prev);
      const wasRemoved = newSet.delete(instanceId);
      console.log('🔓 [CLEANUP] Removing from force pending:', {
        instanceId,
        reason,
        wasRemoved,
        remainingCount: newSet.size,
      });
      return newSet;
    });
    
    // Remove the optimistic message since server version now exists
    setOptimisticMessages((prev) => {
      const filtered = prev.filter((msg) => msg.instanceId !== instanceId);
      const removedCount = prev.length - filtered.length;
      
      console.log('🗑️ [CLEANUP] Cleaning up optimistic messages:', {
        instanceId,
        reason,
        removedCount,
        remainingOptimisticCount: filtered.length,
      });
      
      return filtered;
    });
    
    // Cleanup references
    pendingTimeouts.current.delete(instanceId);
    pendingStartTimes.current.delete(instanceId);
  }, []);

  const commitChatTransaction = useCallback((instanceId: string) => {
    const now = Date.now();
    const startTime = pendingStartTimes.current.get(instanceId);
    const existingTimeout = pendingTimeouts.current.get(instanceId);
    
    console.log('🔄 [COMMIT] Chat transaction commit:', {
      instanceId,
      now,
      startTime,
      hasTimeout: !!existingTimeout,
    });
    
    if (!startTime) {
      console.warn('⚠️ [COMMIT] No start time found for transaction:', instanceId);
      return;
    }
    
    const elapsedTime = now - startTime;
    const remainingTime = MINIMUM_PENDING_DURATION - elapsedTime;
    
    console.log('⏱️ [COMMIT] Timing analysis:', {
      instanceId,
      elapsedTime,
      minimumRequired: MINIMUM_PENDING_DURATION,
      remainingTime,
      shouldDelay: remainingTime > 0,
    });
    
    // Clear the original timeout since we're taking over
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      console.log('⏰ [COMMIT] Cleared original timeout for:', instanceId);
    }
    
    if (remainingTime > 0) {
      // Server responded too quickly - enforce minimum duration
      console.log('🕐 [COMMIT] Enforcing minimum pending duration:', {
        instanceId,
        delayMs: remainingTime,
      });
      
      const delayedTimeout = setTimeout(() => {
        performCleanup(instanceId, 'minimum duration enforced');
      }, remainingTime);
      
      pendingTimeouts.current.set(instanceId, delayedTimeout);
    } else {
      // Minimum duration already met - cleanup immediately
      console.log('✅ [COMMIT] Minimum duration already met, cleaning up immediately:', instanceId);
      performCleanup(instanceId, 'minimum duration already met');
    }
  }, [performCleanup]);

  const handleSearchClose = () => {
    setSearchVisible(false);
    setSearchTerm('');
  };

  return {
    // Refs
    messagesEndRef,
    messagesContainerRef,
    
    // State
    searchTerm,
    setSearchTerm,
    searchVisible,
    setSearchVisible,
    previousMessageCount,
    
    // Computed values
    filteredMessages,
    
    // Handlers
    handleSendMessage,
    handleSearchClose,
    shouldShowDateSeparator,
    getBackgroundStyle,
    commitChatTransaction,
  };
};