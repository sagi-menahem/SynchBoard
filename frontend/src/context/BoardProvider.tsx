// File: frontend/src/context/BoardContext.tsx

import React, { type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useBoard } from '../hooks/useBoard';
import { BoardContext } from './BoardContext';

export const BoardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { boardId: boardIdString } = useParams<{ boardId: string }>();
    const boardId = parseInt(boardIdString || '0', 10);

    const boardData = useBoard(boardId);

    if (isNaN(boardId) || boardId === 0) {
        return <div>Invalid Board ID provided in URL.</div>;
    }

    return (
        <BoardContext.Provider value={boardData}>
            {children}
        </BoardContext.Provider>
    );
};