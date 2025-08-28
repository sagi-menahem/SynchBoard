import React, { type ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import { BoardContext } from './BoardContext';
import { useBoardWorkspace } from './hooks/workspace';


interface BoardProviderProps {
    boardId: number;
    children: ReactNode;
}

export const BoardProvider: React.FC<BoardProviderProps> = ({ boardId, children }) => {
  const { t } = useTranslation(['board', 'common']);

  const boardData = useBoardWorkspace(boardId);

  if (isNaN(boardId) || boardId === 0) {
    return <div>{t('board:provider.invalidIdError')}</div>;
  }

  return <BoardContext.Provider value={boardData}>{children}</BoardContext.Provider>;
};
