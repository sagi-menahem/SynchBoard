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
  commitDrawingTransaction: (instanceId: string) => void;
  commitChatTransaction: (instanceId: string) => void;
}

export const useWebSocketHandler = ({
  boardId,
  sessionInstanceId,
  setBoardName,
  setAccessLost,
  setObjects,
  setMessages,
  commitDrawingTransaction,
  commitChatTransaction,
}: WebSocketHandlerProps) => {
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
          logger.warn('Failed to refresh board name after details update:', err);
        });
    }
  }, [boardId, userEmail, setBoardName, setAccessLost, setMessages]);

  const handleDrawingMessage = useCallback((action: BoardActionResponse) => {
    const isOwnDrawingAction = action.sender === sessionInstanceId && (
      action.type === ActionType.OBJECT_ADD || 
      action.type === ActionType.OBJECT_UPDATE
    );
    
    if (!isOwnDrawingAction) {
      const actionPayload = { ...(action.payload as object), instanceId: action.instanceId } as ActionPayload;
      
      if (action.type === ActionType.OBJECT_ADD) {
        setObjects((prev) => [...prev, actionPayload]);
      } else if (action.type === ActionType.OBJECT_UPDATE) {
        setObjects((prev) => prev.map((obj) => 
          obj.instanceId === action.instanceId ? actionPayload : obj,
        ));
      } else if (action.type === ActionType.OBJECT_DELETE) {
        setObjects((prev) => prev.filter((obj) => obj.instanceId !== action.instanceId));
      }
    }

    commitDrawingTransaction(action.instanceId);
  }, [sessionInstanceId, setObjects, commitDrawingTransaction]);

  const handleChatMessage = useCallback((chatMessage: ChatMessageResponse) => {
    
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
        const newMessages = [...prevMessages];
        newMessages[messageIndex] = chatMessage;
        return newMessages;
      } else {
        return [...prevMessages, chatMessage];
      }
    });

    if (chatMessage.instanceId) {
      commitChatTransaction(chatMessage.instanceId);
    }
  }, [setMessages, commitChatTransaction]);

  const onMessageReceived = useCallback(
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


        if (transactionalMessage.type === ActionType.OBJECT_ADD || 
            transactionalMessage.type === ActionType.OBJECT_UPDATE ||
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
    onMessageReceived, 
    'board-websocket',
  );

  return {
    onMessageReceived,
  };
};