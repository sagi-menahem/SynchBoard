
import React, { useMemo, useRef } from 'react';

import { BoardProvider } from 'features/board';
import type { ToolbarConfig } from 'features/board/types/ToolbarTypes';
import { useCanvasPreferences, useToolPreferences } from 'features/settings/UserPreferencesProvider';
import { ArrowRight, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants';
import { PageLoader, PageTransition, UniversalToolbar } from 'shared/ui';

import { BoardWorkspace, CanvasToolSection } from '../components/workspace';
import { useBoardContext } from '../hooks/context/useBoardContext';


import styles from './BoardPage.module.scss';

interface BoardPageContentProps {
  boardId: number;
}

const BoardPageContent: React.FC<BoardPageContentProps> = ({ boardId }) => {
  const { t } = useTranslation(['board', 'common']);
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
    void updateStrokeColor(color);
  };

  const { preferences: canvasPreferences, updateSplitRatio } =
    useCanvasPreferences();

  const handleSplitRatioChange = (newRatio: number) => {
    void updateSplitRatio(newRatio);
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
              boardName={boardName ?? t('board:fallbacks.untitled')}
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
                background: 'linear-gradient(to bottom, transparent, var(--color-border-light), transparent)',
              }} />
              <span style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
                letterSpacing: '0.02em',
              }}>
                {boardName ?? t('board:fallbacks.untitled')}
              </span>
            </div>
          ),
        },
        {
          type: 'button',
          icon: Info,
          label: t('board:page.boardDetailsButton'),
          onClick: () => navigate(APP_ROUTES.getBoardDetailsRoute(boardId)),
          variant: 'navigation',
          className: 'iconOnlyButton',
        },
        {
          type: 'button',
          icon: ArrowRight,
          label: t('board:page.boardListButton'),
          onClick: () => navigate(APP_ROUTES.BOARD_LIST),
          variant: 'navigation',
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
      t,
    ],
  );

  if (isLoading) {
    return (
      <PageTransition>
        <UniversalToolbar config={toolbarConfig} />
        <PageLoader message={t('board:page.loading')} />
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
  const { t } = useTranslation(['board', 'common']);
  const { boardId } = useParams<{ boardId: string }>();
  const numericBoardId = parseInt(boardId ?? '0', 10);

  if (!numericBoardId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        {t('board:page.loading')}
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
