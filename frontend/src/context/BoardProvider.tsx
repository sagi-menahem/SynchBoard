// File: frontend/src/context/BoardProvider.tsx
import { useBoardSync } from 'hooks/board/workspace/useBoardSync';
import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BoardContext } from './BoardContext';

interface BoardProviderProps {
    boardId: number;
    children: ReactNode;
}

export const BoardProvider: React.FC<BoardProviderProps> = ({ boardId, children }) => {
    const { t } = useTranslation();

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