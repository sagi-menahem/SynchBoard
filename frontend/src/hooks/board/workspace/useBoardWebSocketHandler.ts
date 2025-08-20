import { useCallback } from 'react';

import { AxiosError } from 'axios';
import logger from 'utils/Logger';

import { WEBSOCKET_TOPICS } from 'constants/ApiConstants';
import { useAuth } from 'hooks/auth/useAuth';
import { useSocketSubscription } from 'hooks/common/useSocket';
import * as boardService from 'services/BoardService';
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
    // Chat transaction commit handler (optional - only used if chat uses separate transaction system)
    commitChatTransaction?: (instanceId: string) => void;
}

export const useBoardWebSocketHandler = ({
  boardId,
  sessionInstanceId,
  setBoardName,
  setAccessLost,
  setObjects,
  setMessages,
  commitTransaction,
  commitChatTransaction,
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
              console.warn('Failed to refresh board name after details update:', err);
            });
        }
      } else if ('type' in payload && 'instanceId' in payload) {
        // UNIFIED TRANSACTIONAL HANDLER: Process all messages with type and instanceId
        // This includes both drawing actions (OBJECT_ADD, OBJECT_DELETE) and chat messages (CHAT)
        const transactionalMessage = payload as {
          type: string;
          instanceId: string;
          sender?: string;
          payload?: object;
        };
        logger.debug(
          `[UNIFIED] Received transactional message. Type: ${transactionalMessage.type}, InstanceId: ${transactionalMessage.instanceId}`,
        );
        
        // Branch based on message type for specific processing
        if (
          transactionalMessage.type === ActionType.OBJECT_ADD ||
          transactionalMessage.type === ActionType.OBJECT_DELETE
        ) {
          // DRAWING ACTION PROCESSING
          const action = transactionalMessage as BoardActionResponse;
          const isOwnDrawingAction = action.sender === sessionInstanceId && action.type === ActionType.OBJECT_ADD;
          
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
          
          setMessages((prevMessages) => {
            // Robust findIndex logic with comprehensive matching
            const messageIndex = prevMessages.findIndex((msg) => {
              const pendingMsg = msg as ChatMessageResponse & {
              transactionId?: string;
              instanceId?: string;
            };
              // Primary match: server instanceId matches our transactionId (most common case)
              if (pendingMsg.transactionId === chatMessage.instanceId) {
                return true;
              }
              // Fallback match: instanceId matches instanceId (edge cases)
              if (pendingMsg.instanceId === chatMessage.instanceId) {
                return true;
              }
              return false;
            });

            if (messageIndex !== -1) {
              logger.debug(`[UNIFIED] Match found for chat instanceId: ${chatMessage.instanceId}. Replacing pending message at index ${messageIndex}.`);
              const newMessages = [...prevMessages];
              // Replace the pending message with the confirmed one from the server
              newMessages[messageIndex] = chatMessage;
              return newMessages;
            } else {
              logger.debug(`[UNIFIED] No pending chat message found for instanceId: ${chatMessage.instanceId}. Appending new message.`);
              // If no match, it's a message from another user, so append it
              return [...prevMessages, chatMessage];
            }
          });
        } else {
          logger.warn(`[UNIFIED] Unknown transactional message type: ${transactionalMessage.type}`);
        }

        // SMART COMMIT: Route confirmations to the correct transaction system
        if (
          transactionalMessage.type === ActionType.OBJECT_ADD ||
          transactionalMessage.type === ActionType.OBJECT_DELETE
        ) {
          // Drawing actions use the main transaction system
          logger.debug(`Server confirmed ${transactionalMessage.type}: ${transactionalMessage.instanceId}`);
          commitTransaction(transactionalMessage.instanceId);
        } else if (transactionalMessage.type === 'CHAT') {
          // Chat messages use their own transaction system if available
          logger.debug(`Server confirmed ${transactionalMessage.type}: ${transactionalMessage.instanceId}`);
          if (commitChatTransaction) {
            commitChatTransaction(transactionalMessage.instanceId);
          } else {
            // Fallback to main transaction system if chat system not available
            commitTransaction(transactionalMessage.instanceId);
          }
        }
        
      }
    },
    [
      boardId,
      userEmail,
      sessionInstanceId,
      setBoardName,
      setAccessLost,
      setObjects,
      setMessages,
      commitTransaction,
      commitChatTransaction,
    ],
  );

  useSocketSubscription(boardId ? WEBSOCKET_TOPICS.BOARD(boardId) : '', onMessageReceived, 'board');

  return {
    onMessageReceived,
  };
};