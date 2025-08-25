import React, { useCallback, useRef } from 'react';

import { BoardProvider, useCanvasPreferences } from 'context';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { BoardWorkspace, HeaderToolbar } from 'components/board/workspace';
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
    boardDetails,
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
  
  const handleColorPick = useCallback((color: string) => {
    setStrokeColor(color);
  }, [setStrokeColor]);
  
  const {
    preferences: canvasPreferences,
    updateSplitRatio,
  } = useCanvasPreferences();


  const handleSplitRatioChange = useCallback((newRatio: number) => {
    updateSplitRatio(newRatio);
  }, [updateSplitRatio]);

  if (isLoading) {
    return <div>{t('boardPage.loading')}</div>;
  }

  const canvasConfig = boardDetails ? {
    backgroundColor: boardDetails.canvasBackgroundColor,
    width: boardDetails.canvasWidth,
    height: boardDetails.canvasHeight,
  } : undefined;

  return (
    <div className={styles.page} ref={pageRef} data-board-page>
      <HeaderToolbar
        boardId={boardId}
        boardName={boardName || 'Board'}
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

      <div className={styles.boardWorkspaceArea}>
        <BoardWorkspace
          boardId={boardId}
          instanceId={instanceId}
          objects={objects}
          messages={messages}
          tool={tool}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          canvasConfig={canvasConfig}
          splitRatio={canvasPreferences.canvasChatSplitRatio}
          onDraw={handleDrawAction}
          onSplitRatioChange={handleSplitRatioChange}
          onColorPick={handleColorPick}
        />
      </div>
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
