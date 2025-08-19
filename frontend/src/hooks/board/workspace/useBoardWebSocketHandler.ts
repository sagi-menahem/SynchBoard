import { useCallback } from 'react';

import { AxiosError } from 'axios';
import logger from 'utils/logger';

import { WEBSOCKET_TOPICS } from 'constants/ApiConstants';
import { useAuth } from 'hooks/auth/useAuth';
import { useSocketSubscription } from 'hooks/common/useSocket';
import * as boardService from 'services/boardService';
import { ActionType, type ActionPayload, type BoardActionResponse } from 'types/BoardObjectTypes';
import type { ChatMessageResponse } from 'types/MessageTypes';
import type { BoardUpdateDTO } from 'types/WebSocketTypes';

interface WebSocketHandlerProps {
    boardId: number;
    sessionInstanceId: string;
    setBoardName: (name: string) => void;
    setAccessLost: (lost: boolean) => void;
    setObjects: React.Dispatch<React.SetStateAction<ActionPayload[]>>;
    setMessages: React.Dispatch<React.SetStateAction<ChatMessageResponse[]>>;
    // Transactional State: For committing pending actions
    commitTransaction: (instanceId: string) => void;
}

export const useBoardWebSocketHandler = ({
  boardId,
  sessionInstanceId,
  setBoardName,
  setAccessLost,
  setObjects,
  setMessages,
  commitTransaction,
}: WebSocketHandlerProps) => {
  const { userEmail } = useAuth();

  const onMessageReceived = useCallback(
    (payload: unknown) => {
      if (typeof payload !== 'object' || !payload) return;

      if ('updateType' in payload && 'sourceUserEmail' in payload) {
        const update = payload as BoardUpdateDTO;
        if (update.sourceUserEmail === userEmail) return;
                
        if (update.updateType === 'MEMBERS_UPDATED') {
          boardService.getBoardMessages(boardId).then(setMessages);
          boardService
            .getBoardDetails(boardId)
            .then((details) => setBoardName(details.name))
            .catch((err) => {
              if (err instanceof AxiosError && err.response?.status === 403) {
                setAccessLost(true);
              }
            });
        } else if (update.updateType === 'DETAILS_UPDATED') {
          boardService
            .getBoardDetails(boardId)
            .then((details) => setBoardName(details.name))
            .catch((err) => {
              logger.warn('Failed to refresh board name after details update:', err);
            });
        }
      } else if ('type' in payload && 'instanceId' in payload) {
        // UNIFIED TRANSACTIONAL HANDLER: Process all messages with type and instanceId
        // This includes both drawing actions (OBJECT_ADD, OBJECT_DELETE) and chat messages (CHAT)
        const transactionalMessage = payload as any;
        logger.debug(`[UNIFIED] Received transactional message. Type: ${transactionalMessage.type}, InstanceId: ${transactionalMessage.instanceId}`);
        
        // Branch based on message type for specific processing
        if (transactionalMessage.type === ActionType.OBJECT_ADD || 
            transactionalMessage.type === ActionType.OBJECT_DELETE) {
          // DRAWING ACTION PROCESSING
          const action = transactionalMessage as BoardActionResponse;
          const isOwnDrawingAction = action.sender === sessionInstanceId && 
            action.type === ActionType.OBJECT_ADD;
          
          // Process the action for non-own actions
          if (!isOwnDrawingAction) {
            const actionPayload = { ...(action.payload as object), instanceId: action.instanceId } as ActionPayload;
            if (action.type === ActionType.OBJECT_ADD) {
              logger.debug(`[UNIFIED] Processing OBJECT_ADD for instanceId: ${action.instanceId}`);
              setObjects((prev) => [...prev, actionPayload]);
            } else if (action.type === ActionType.OBJECT_DELETE) {
              logger.debug(`[UNIFIED] Processing OBJECT_DELETE for instanceId: ${action.instanceId}`);
              setObjects((prev) => prev.filter((obj) => obj.instanceId !== action.instanceId));
            }
          }
          
        } else if (transactionalMessage.type === 'CHAT') {
          // CHAT MESSAGE PROCESSING
          const chatMessage = transactionalMessage as ChatMessageResponse;
          logger.debug(`[UNIFIED] Processing CHAT message with instanceId: ${chatMessage.instanceId}`);
          
          let shouldCommitTransaction = false;
          let transactionIdToCommit: string | null = null;
          
          setMessages((prevMessages) => {
            // Enhanced findIndex logic with improved matching for queued messages
            const messageIndex = prevMessages.findIndex((msg) => {
              const enhancedMsg = msg as any;
              
              // Primary match: server instanceId matches our transactionId (most common case)
              if (enhancedMsg.transactionId === chatMessage.instanceId) {
                logger.debug(`[UNIFIED] Found message by transactionId match: ${chatMessage.instanceId}`);
                return true;
              }
              
              // Secondary match: instanceId matches instanceId (edge cases)
              if (enhancedMsg.instanceId === chatMessage.instanceId) {
                logger.debug(`[UNIFIED] Found message by instanceId match: ${chatMessage.instanceId}`);
                return true;
              }
              
              // REMOVED: Queue-related message matching logic (no longer needed in simple system)
              
              return false;
            });

            if (messageIndex !== -1) {
              logger.debug(`[UNIFIED] Match found for chat instanceId: ${chatMessage.instanceId}. Updating message at index ${messageIndex}.`);
              const newMessages = [...prevMessages];
              
              // CRITICAL FIX: Preserve original message for transaction commitment
              const originalMessage = prevMessages[messageIndex] as any;
              
              // Update the message with server data while preserving transaction tracking
              const updatedMessage = {
                ...chatMessage,
                transactionStatus: 'confirmed', // Explicitly mark as confirmed
              } as any; // Type assertion to handle transactionStatus property which exists at runtime but not in ChatMessageResponse interface
              
              // Preserve transaction tracking data
              if (originalMessage.transactionId) {
                updatedMessage.transactionId = originalMessage.transactionId;
              }
              
              newMessages[messageIndex] = updatedMessage;
              
              // Schedule transaction commitment AFTER state update
              if (originalMessage.transactionId) {
                shouldCommitTransaction = true;
                transactionIdToCommit = originalMessage.transactionId;
                logger.debug(`[UNIFIED] Scheduling transaction commit for: ${originalMessage.transactionId}`);
              }
              
              return newMessages;
            } else {
              logger.debug(`[UNIFIED] No pending chat message found for instanceId: ${chatMessage.instanceId}. Appending new message.`);
              // If no match, it's a message from another user, so append it
              return [...prevMessages, chatMessage];
            }
          });
          
          // CRITICAL FIX: Commit transaction AFTER message state has been updated
          // This ensures the onSuccess callback sees the updated message
          if (shouldCommitTransaction && transactionIdToCommit) {
            // Use setTimeout to ensure state update completes first
            const transactionId = transactionIdToCommit;
            setTimeout(() => {
              logger.debug(`[UNIFIED] Committing transaction for chat message: ${transactionId}`);
              commitTransaction(transactionId);
            }, 0);
          }
        } else {
          logger.warn(`[UNIFIED] Unknown transactional message type: ${transactionalMessage.type}`);
        }

        // DRAWING COMMIT: Only commit drawing transactions here
        // Chat messages handle their own commitment timing above
        if (transactionalMessage.type === ActionType.OBJECT_ADD || 
            transactionalMessage.type === ActionType.OBJECT_DELETE) {
          logger.debug(`[UNIFIED] Committing drawing transaction for instanceId: ${transactionalMessage.instanceId}`);
          commitTransaction(transactionalMessage.instanceId);
        }
        
      }
    },
    [boardId, userEmail, sessionInstanceId, setBoardName, setAccessLost, setObjects, setMessages, commitTransaction],
  );

  useSocketSubscription(boardId ? WEBSOCKET_TOPICS.BOARD(boardId) : '', onMessageReceived, 'board');

  return {
    onMessageReceived,
  };
};