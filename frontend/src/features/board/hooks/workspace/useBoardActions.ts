import { useCallback, useState } from 'react';

import * as boardService from 'features/board/services/boardService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'shared/utils/logger';



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
