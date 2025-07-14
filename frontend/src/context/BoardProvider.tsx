// File: frontend/src/context/BoardProvider.tsx

import React, { type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBoardSync } from '../hooks/useBoard';
import { BoardContext } from './BoardContext';

export const BoardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    const { boardId: boardIdString } = useParams<{ boardId: string }>();
    const boardId = parseInt(boardIdString || '0', 10);
    const boardData = useBoardSync(boardId);

    if (isNaN(boardId) || boardId === 0) {
        return <div>{t('boardProvider.invalidIdError')}</div>;
    }

    return (
        <BoardContext.Provider value={boardData}>
            {children}
        </BoardContext.Provider>
    );
};