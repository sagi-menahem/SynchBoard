import { useCallback, useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import * as boardService from 'services/boardService';


export const useBoardActions = (boardId: number) => {
    const { t } = useTranslation();
    const [undoCount, setUndoCount] = useState(0);
    const [redoCount, setRedoCount] = useState(0);

    const handleUndo = useCallback(() => {
        if (undoCount === 0) {
            toast.error(t('boardSync.nothingToUndo'));
            return;
        }
        boardService
            .undoLastAction(boardId)
            .then(() => {
                setUndoCount((prev) => prev - 1);
                setRedoCount((prev) => prev + 1);
            })
            .catch((error) => {
                logger.error('Undo failed on the server:', error);
            });
    }, [boardId, undoCount, t]);

    const handleRedo = useCallback(() => {
        if (redoCount === 0) {
            toast.error(t('boardSync.nothingToRedo'));
            return;
        }
        boardService
            .redoLastAction(boardId)
            .then(() => {
                setUndoCount((prev) => prev + 1);
                setRedoCount((prev) => prev - 1);
            })
            .catch((error) => {
                logger.error('Redo failed on the server:', error);
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
