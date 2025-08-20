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
    commitTransaction: (instanceId: string) => void;
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
        const transactionalMessage = payload as {
          type: string;
          instanceId: string;
          sender?: string;
          payload?: object;
        };
        logger.debug(
          `[UNIFIED] Received transactional message. Type: ${transactionalMessage.type}, InstanceId: ${transactionalMessage.instanceId}`,
        );
        if (
          transactionalMessage.type === ActionType.OBJECT_ADD ||
          transactionalMessage.type === ActionType.OBJECT_DELETE
        ) {
          const action = transactionalMessage as BoardActionResponse;
          const isOwnDrawingAction = action.sender === sessionInstanceId && action.type === ActionType.OBJECT_ADD;
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
          const chatMessage = transactionalMessage as ChatMessageResponse;
          logger.debug(`[UNIFIED] Processing CHAT message with instanceId: ${chatMessage.instanceId}`);
          
          setMessages((prevMessages) => {
            const messageIndex = prevMessages.findIndex((msg) => {
              const pendingMsg = msg as ChatMessageResponse & {
              transactionId?: string;
              instanceId?: string;
            };
              if (pendingMsg.transactionId === chatMessage.instanceId) {
                return true;
              }
              if (pendingMsg.instanceId === chatMessage.instanceId) {
                return true;
              }
              return false;
            });

            if (messageIndex !== -1) {
              logger.debug(`[UNIFIED] Match found for chat instanceId: ${chatMessage.instanceId}. Replacing pending message at index ${messageIndex}.`);
              const newMessages = [...prevMessages];
              newMessages[messageIndex] = chatMessage;
              return newMessages;
            } else {
              logger.debug(`[UNIFIED] No pending chat message found for instanceId: ${chatMessage.instanceId}. Appending new message.`);
              return [...prevMessages, chatMessage];
            }
          });
        } else {
          logger.warn(`[UNIFIED] Unknown transactional message type: ${transactionalMessage.type}`);
        }

        if (
          transactionalMessage.type === ActionType.OBJECT_ADD ||
          transactionalMessage.type === ActionType.OBJECT_DELETE
        ) {
          logger.debug(`Server confirmed ${transactionalMessage.type}: ${transactionalMessage.instanceId}`);
          commitTransaction(transactionalMessage.instanceId);
        } else if (transactionalMessage.type === 'CHAT') {
          logger.debug(`Server confirmed ${transactionalMessage.type}: ${transactionalMessage.instanceId}`);
          if (commitChatTransaction) {
            commitChatTransaction(transactionalMessage.instanceId);
          } else {
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