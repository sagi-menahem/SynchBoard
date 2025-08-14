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
    // Transactional State: For pending actions commit/rollback
    setPendingActions: React.Dispatch<React.SetStateAction<Map<string, ActionPayload>>>;
}

export const useBoardWebSocketHandler = ({
  boardId,
  sessionInstanceId,
  setBoardName,
  setAccessLost,
  setObjects,
  setMessages,
  setPendingActions,
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
        const action = payload as BoardActionResponse;
        const isOwnDrawingAction = action.sender === sessionInstanceId && action.type === ActionType.OBJECT_ADD;
                
        // Process the action for non-own actions
        if (!isOwnDrawingAction) {
          const actionPayload = { ...(action.payload as object), instanceId: action.instanceId } as ActionPayload;
          if (action.type === ActionType.OBJECT_ADD) {
            setObjects((prev) => [...prev, actionPayload]);
          } else if (action.type === ActionType.OBJECT_DELETE) {
            setObjects((prev) => prev.filter((obj) => obj.instanceId !== action.instanceId));
          }
        }

        // Transactional Commit: Check if this confirms a pending action we sent
        // This happens for both our own actions and others' (but only matters for our own)
        setPendingActions((prev) => {
          const next = new Map(prev);
          if (next.has(action.instanceId)) {
            next.delete(action.instanceId);
            logger.debug(`Committed pending action: ${action.instanceId}`);
          }
          return next;
        });
      } else if ('content' in payload && 'senderFullName' in payload) {
        setMessages((prev) => [...prev, payload as ChatMessageResponse]);
      }
    },
    [boardId, userEmail, sessionInstanceId, setBoardName, setAccessLost, setObjects, setMessages, setPendingActions],
  );

  useSocketSubscription(boardId ? WEBSOCKET_TOPICS.BOARD(boardId) : '', onMessageReceived, 'board');

  return {
    onMessageReceived,
  };
};
