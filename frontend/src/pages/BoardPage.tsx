import { APP_ROUTES } from 'constants';

import React, { useMemo, useRef } from 'react';

import { BoardProvider, useCanvasPreferences } from 'context';
import { ArrowRight, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { BoardWorkspace, CanvasToolSection } from 'components/board/workspace';
import { PageLoader, PageTransition, UniversalToolbar } from 'components/common';
import { useToolPreferences } from 'context/ToolPreferencesContext';
import { useBoardContext } from 'hooks/board';
import type { ToolbarConfig } from 'types/ToolbarTypes';

import styles from './BoardPage.module.css';

interface BoardPageContentProps {
  boardId: number;
}

const BoardPageContent: React.FC<BoardPageContentProps> = ({ boardId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const {
    preferences,
    updateTool,
    updateStrokeColor,
    updateStrokeWidth,
  } = useToolPreferences();
  
  const tool = preferences.defaultTool;
  const strokeColor = preferences.defaultStrokeColor;  
  const strokeWidth = preferences.defaultStrokeWidth;

  const handleColorPick = (color: string) => {
    updateStrokeColor(color);
  };

  const { preferences: canvasPreferences, updateSplitRatio } =
    useCanvasPreferences();

  const handleSplitRatioChange = (newRatio: number) => {
    updateSplitRatio(newRatio);
  };

  const canvasConfig = useMemo(() => {
    return boardDetails
      ? {
          backgroundColor: boardDetails.canvasBackgroundColor,
          width: boardDetails.canvasWidth,
          height: boardDetails.canvasHeight,
        }
      : undefined;
  }, [boardDetails]);

  const toolbarConfig: ToolbarConfig = useMemo(
    () => ({
      pageType: 'canvas',
      leftSection: [
        {
          type: 'custom',
          content: (
            <CanvasToolSection
              boardName={boardName || 'Board'}
              strokeColor={strokeColor}
              setStrokeColor={updateStrokeColor}
              strokeWidth={strokeWidth}
              setStrokeWidth={updateStrokeWidth}
              tool={tool}
              setTool={updateTool}
              onUndo={handleUndo}
              isUndoAvailable={isUndoAvailable}
              onRedo={handleRedo}
              isRedoAvailable={isRedoAvailable}
              canvasConfig={canvasConfig}
            />
          ),
        },
      ],
      rightSection: [
        {
          type: 'custom',
          content: (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              paddingRight: '8px',
              position: 'relative',
            }}>
              <div style={{
                width: '1px',
                height: '32px',
                background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.1), transparent)',
              }} />
              <span style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'rgba(255, 255, 255, 0.9)',
                letterSpacing: '0.02em',
              }}>
                {boardName || 'Untitled Board'}
              </span>
            </div>
          ),
        },
        {
          type: 'button',
          icon: Info,
          label: '',
          onClick: () => navigate(APP_ROUTES.getBoardDetailsRoute(boardId)),
          className: 'iconOnlyButton',
        },
        {
          type: 'button',
          icon: ArrowRight,
          label: '',
          onClick: () => navigate(APP_ROUTES.BOARD_LIST),
          className: 'iconOnlyButton',
        },
      ],
    }),
    [
      boardName,
      strokeColor,
      updateStrokeColor,
      strokeWidth,
      updateStrokeWidth,
      tool,
      updateTool,
      handleUndo,
      isUndoAvailable,
      handleRedo,
      isRedoAvailable,
      canvasConfig,
      navigate,
      boardId,
    ],
  );

  if (isLoading) {
    return (
      <PageTransition>
        <UniversalToolbar config={toolbarConfig} />
        <PageLoader message={t('boardPage.loading')} />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <UniversalToolbar config={toolbarConfig} />
      <div className={styles.pageContent} ref={pageRef} data-board-page>
        <div className={styles.boardWorkspaceArea}>
          <BoardWorkspace
            boardId={boardId}
            instanceId={instanceId}
            objects={objects}
            messages={messages}
            tool={tool}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            fontSize={strokeWidth}
            canvasConfig={canvasConfig}
            splitRatio={canvasPreferences.canvasChatSplitRatio}
            onDraw={handleDrawAction}
            onSplitRatioChange={handleSplitRatioChange}
            onColorPick={handleColorPick}
            isLoading={isLoading}
          />
        </div>
      </div>
    </PageTransition>
  );
};

const BoardPage: React.FC = () => {
  const { t } = useTranslation();
  const { boardId } = useParams<{ boardId: string }>();
  const numericBoardId = parseInt(boardId || '0', 10);

  if (!numericBoardId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        {t('boardPage.loading')}
      </div>
    );
  }

  return (
    <BoardProvider boardId={numericBoardId}>
      <BoardPageContent boardId={numericBoardId} />
    </BoardProvider>
  );
};

export default BoardPage;
