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

interface UnifiedWebSocketHandlerProps {
  boardId: number;
  sessionInstanceId: string;
  setBoardName: (name: string) => void;
  setAccessLost: (lost: boolean) => void;
  setObjects: React.Dispatch<React.SetStateAction<ActionPayload[]>>;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageResponse[]>>;
  commitDrawingTransaction: (instanceId: string) => void;
  commitChatTransaction: (instanceId: string) => void;
}

export const useUnifiedWebSocketHandler = ({
  boardId,
  sessionInstanceId,
  setBoardName,
  setAccessLost,
  setObjects,
  setMessages,
  commitDrawingTransaction,
  commitChatTransaction,
}: UnifiedWebSocketHandlerProps) => {
  const { userEmail } = useAuth();

  const handleBoardUpdate = useCallback((update: BoardUpdateDTO) => {
    if (update.sourceUserEmail === userEmail || !userEmail) return;
    
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
  }, [boardId, userEmail, setBoardName, setAccessLost, setMessages]);

  const handleDrawingMessage = useCallback((action: BoardActionResponse) => {
    const isOwnDrawingAction = action.sender === sessionInstanceId && action.type === ActionType.OBJECT_ADD;
    
    if (!isOwnDrawingAction) {
      const actionPayload = { ...(action.payload as object), instanceId: action.instanceId } as ActionPayload;
      
      if (action.type === ActionType.OBJECT_ADD) {
        logger.debug(`Processing drawing OBJECT_ADD for instanceId: ${action.instanceId}`);
        setObjects((prev) => [...prev, actionPayload]);
      } else if (action.type === ActionType.OBJECT_DELETE) {
        logger.debug(`Processing drawing OBJECT_DELETE for instanceId: ${action.instanceId}`);
        setObjects((prev) => prev.filter((obj) => obj.instanceId !== action.instanceId));
      }
    }

    logger.debug(`Server confirmed drawing ${action.type}: ${action.instanceId}`);
    commitDrawingTransaction(action.instanceId);
  }, [sessionInstanceId, setObjects, commitDrawingTransaction]);

  const handleChatMessage = useCallback((chatMessage: ChatMessageResponse) => {
    logger.debug(`Processing CHAT message with instanceId: ${chatMessage.instanceId}`);
    
    setMessages((prevMessages) => {
      const messageIndex = prevMessages.findIndex((msg) => {
        const pendingMsg = msg as ChatMessageResponse & {
          transactionId?: string;
          instanceId?: string;
        };
        
        return pendingMsg.transactionId === chatMessage.instanceId || 
               pendingMsg.instanceId === chatMessage.instanceId;
      });

      if (messageIndex !== -1) {
        logger.debug(`Match found for chat instanceId: ${chatMessage.instanceId}. Replacing pending message at index ${messageIndex}.`);
        const newMessages = [...prevMessages];
        newMessages[messageIndex] = chatMessage;
        return newMessages;
      } else {
        logger.debug(`No pending chat message found for instanceId: ${chatMessage.instanceId}. Appending new message.`);
        return [...prevMessages, chatMessage];
      }
    });

    logger.debug(`Server confirmed chat message: ${chatMessage.instanceId}`);
    if (chatMessage.instanceId) {
      commitChatTransaction(chatMessage.instanceId);
    }
  }, [setMessages, commitChatTransaction]);

  const onUnifiedMessageReceived = useCallback(
    (payload: unknown) => {
      if (typeof payload !== 'object' || !payload) return;

      if ('updateType' in payload && 'sourceUserEmail' in payload) {
        handleBoardUpdate(payload as BoardUpdateDTO);
        return;
      }

      if ('type' in payload && 'instanceId' in payload) {
        const transactionalMessage = payload as {
          type: string;
          instanceId: string;
          sender?: string;
          payload?: object;
        };

        logger.debug(
          `Received transactional message. Type: ${transactionalMessage.type}, InstanceId: ${transactionalMessage.instanceId}`,
        );

        if (transactionalMessage.type === ActionType.OBJECT_ADD || 
            transactionalMessage.type === ActionType.OBJECT_DELETE) {
          handleDrawingMessage(transactionalMessage as BoardActionResponse);
        } else if (transactionalMessage.type === 'CHAT') {
          handleChatMessage(transactionalMessage as ChatMessageResponse);
        } else {
          logger.warn(`Unknown transactional message type: ${transactionalMessage.type}`);
        }
        return;
      }

      logger.warn('Received unknown WebSocket message format:', payload);
    },
    [handleBoardUpdate, handleDrawingMessage, handleChatMessage],
  );

  useSocketSubscription(
    boardId ? WEBSOCKET_TOPICS.BOARD(boardId) : '', 
    onUnifiedMessageReceived, 
    'unified-board',
  );

  return {
    onUnifiedMessageReceived,
  };
};