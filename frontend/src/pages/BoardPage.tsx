import React, { useRef } from 'react';

import { BoardProvider } from 'context';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { BoardHeader, BoardWorkspace, Toolbar } from 'components/board/workspace';
import { useBoardContext, useToolbarState } from 'hooks/board';

import styles from './BoardPage.module.css';

interface BoardPageContentProps {
    boardId: number;
}

const BoardPageContent: React.FC<BoardPageContentProps> = ({ boardId }) => {
  const { t } = useTranslation();
  const pageRef = useRef<HTMLDivElement>(null);

  const {
    isLoading,
    boardName,
    objects,
    messages,
    instanceId,
    handleDrawAction,
    handleUndo,
    handleRedo,
    isUndoAvailable,
    isRedoAvailable,
  } = useBoardContext();

  const { tool, setTool, strokeColor, setStrokeColor, strokeWidth, setStrokeWidth } = useToolbarState();

  if (isLoading) {
    return <div>{t('boardPage.loading')}</div>;
  }

  return (
    <div className={styles.page} ref={pageRef}>
      <BoardHeader boardId={boardId} boardName={boardName} />

      <Toolbar
        containerRef={pageRef}
        strokeColor={strokeColor}
        setStrokeColor={setStrokeColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        tool={tool}
        setTool={setTool}
        onUndo={handleUndo}
        isUndoAvailable={isUndoAvailable}
        onRedo={handleRedo}
        isRedoAvailable={isRedoAvailable}
      />

      <BoardWorkspace
        boardId={boardId}
        instanceId={instanceId}
        objects={objects}
        messages={messages}
        tool={tool}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        onDraw={handleDrawAction}
      />
    </div>
  );
};

const BoardPage: React.FC = () => {
  const { t } = useTranslation();
  const { boardId } = useParams<{ boardId: string }>();
  const numericBoardId = parseInt(boardId || '0', 10);

  if (!numericBoardId) {
    return <div>{t('boardPage.loading')}</div>;
  }

  return (
    <BoardProvider boardId={numericBoardId}>
      <BoardPageContent boardId={numericBoardId} />
    </BoardProvider>
  );
};

export default BoardPage;
