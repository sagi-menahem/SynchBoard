import * as boardService from 'features/board/services/boardService';
import { useCallback, useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'shared/utils/logger';

/**
 * Custom hook that manages board action operations including undo/redo functionality.
 * This hook provides comprehensive action history management for collaborative whiteboard operations
 * including state tracking for undo/redo availability, action counters, and API integration for
 * action reversal. It maintains local state to track action counts and provides utility functions
 * for resetting and incrementing counters based on board state changes. The hook ensures proper
 * user feedback through toast notifications and handles error scenarios gracefully while maintaining
 * action history consistency across collaborative sessions.
 * 
 * @param boardId - ID of the board for which to manage action operations
 * @returns Object containing action counts, availability flags, undo/redo handlers, and counter management functions
 */
export const useBoardActions = (boardId: number) => {
  const { t } = useTranslation(['board', 'common']);
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);

  const handleUndo = useCallback(() => {
    if (undoCount === 0) {
      toast.error(t('board:boardSync.nothingToUndo'));
      return;
    }
    boardService
      .undoLastAction(boardId)
      .then(() => {
        setUndoCount((prev) => prev - 1);
        setRedoCount((prev) => prev + 1);
      })
      .catch((error) => {
        logger.error('[useBoardActions] Failed to undo action:', error);
        toast.error(t('board:errors.action.undo'));
      });
  }, [boardId, undoCount, t]);

  const handleRedo = useCallback(() => {
    if (redoCount === 0) {
      toast.error(t('board:boardSync.nothingToRedo'));
      return;
    }
    boardService
      .redoLastAction(boardId)
      .then(() => {
        setUndoCount((prev) => prev + 1);
        setRedoCount((prev) => prev - 1);
      })
      .catch((error) => {
        logger.error('[useBoardActions] Failed to redo action:', error);
        toast.error(t('board:errors.action.redo'));
      });
  }, [boardId, redoCount, t]);

  const resetCounts = useCallback((objectsLength: number) => {
    setUndoCount(objectsLength);
    setRedoCount(0);
  }, []);

  const incrementUndo = useCallback(() => {
    setUndoCount((prev) => prev + 1);
    setRedoCount(0);
  }, []);

  return {
    undoCount,
    redoCount,
    isUndoAvailable: undoCount > 0,
    isRedoAvailable: redoCount > 0,
    handleUndo,
    handleRedo,
    resetCounts,
    incrementUndo,
  };
};
