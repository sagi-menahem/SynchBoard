import { BoardProvider } from 'features/board';
import { BoardWorkspace } from 'features/board/components/workspace';
import { useBoardContext } from 'features/board/hooks/context/useBoardContext';
import { useCanvasPreferences } from 'features/settings/CanvasPreferencesProvider';
import { useToolPreferences } from 'features/settings/ToolPreferencesProvider';
import { ArrowLeft, ArrowRight, Download, Info } from 'lucide-react';
import React, { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants';
import { UI_CONSTANTS } from 'shared/constants/UIConstants';
import { AppHeader, Button, PageLoader, PageTransition } from 'shared/ui';
import { isRTL } from 'shared/utils/rtlUtils';

import { FloatingActions } from '../components/workspace/FloatingActions';
import { FloatingDock } from '../components/workspace/FloatingDock';
import { useCanvasDownload } from '../hooks/useCanvasDownload';

import styles from './BoardPage.module.scss';

/**
 * Props interface for the BoardPageContent component.
 */
interface BoardPageContentProps {
  /** ID of the board to render and manage in the collaborative workspace */
  boardId: number;
}

/**
 * Board Page Content component that provides the complete collaborative whiteboard workspace.
 * This component serves as the main drawing and collaboration interface with a slimmed-down
 * header and floating tool dock. It manages tool state, canvas preferences, drawing actions,
 * and provides full-featured whiteboard functionality with undo/redo, export capabilities,
 * and multi-user interaction support.
 *
 * @param boardId - ID of the board to render and manage in the workspace
 */
const BoardPageContent: React.FC<BoardPageContentProps> = ({ boardId }) => {
  const { t, i18n } = useTranslation(['board', 'common']);
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
  } = useBoardContext();

  const { preferences } = useToolPreferences();

  // Extract current tool settings from user preferences
  const tool = preferences.defaultTool;
  const strokeColor = preferences.defaultStrokeColor;
  const strokeWidth = preferences.defaultStrokeWidth;

  const handleColorPick = useCallback((color: string) => {
    // Color picking is now handled internally by FloatingDock
    // This is kept for BoardWorkspace compatibility
  }, []);

  const { preferences: canvasPreferences, updateSplitRatio } = useCanvasPreferences();

  const handleSplitRatioChange = (newRatio: number) => {
    void updateSplitRatio(newRatio);
  };

  // Create canvas configuration from board details - memoized to prevent unnecessary re-renders
  const canvasConfig = useMemo(() => {
    return boardDetails
      ? {
          backgroundColor: boardDetails.canvasBackgroundColor,
          width: boardDetails.canvasWidth,
          height: boardDetails.canvasHeight,
        }
      : undefined;
  }, [boardDetails]);

  const { handleDownload } = useCanvasDownload({
    boardName: boardName ?? t('board:fallbacks.untitled'),
    canvasConfig,
  });

  // Navigation handlers
  const handleGoToDetails = useCallback(() => {
    navigate(APP_ROUTES.getBoardDetailsRoute(boardId));
  }, [navigate, boardId]);

  const handleGoToList = useCallback(() => {
    navigate(APP_ROUTES.BOARD_LIST);
  }, [navigate]);

  // RTL-aware back arrow
  const BackArrow = isRTL(i18n.language) ? ArrowRight : ArrowLeft;

  if (isLoading) {
    return (
      <PageTransition>
        <AppHeader
          leading={
            <Button variant="icon" onClick={handleGoToList} title={t('board:page.boardListButton')}>
              <BackArrow size={20} />
            </Button>
          }
          title={<span>{t('board:page.loading')}</span>}
        />
        <PageLoader message={t('board:page.loading')} />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      {/* Slim Header with navigation, title, info, and export only */}
      <AppHeader
        leading={
          <Button variant="icon" onClick={handleGoToList} title={t('board:page.boardListButton')}>
            <BackArrow size={20} />
          </Button>
        }
        title={<span className={styles.boardTitle}>{boardName ?? t('board:fallbacks.untitled')}</span>}
        trailing={
          <>
            <Button
              variant="icon"
              onClick={handleDownload}
              title={t('board:header.export')}
            >
              <Download size={20} />
            </Button>
            <Button
              variant="icon"
              onClick={handleGoToDetails}
              title={t('board:header.info')}
            >
              <Info size={20} />
            </Button>
          </>
        }
      />

      {/* Main Content Area */}
      <main className={styles.pageContent} ref={pageRef} data-board-page>
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

        {/* Floating UI Components */}
        <FloatingDock />
        <FloatingActions />
      </main>
    </PageTransition>
  );
};

/**
 * Board Page component that serves as the entry point for the collaborative whiteboard experience.
 * This component handles board ID validation, provides the BoardProvider context for state management,
 * and renders the complete board workspace. It ensures proper board ID parsing and validation before
 * initializing the collaborative workspace environment.
 */
const BoardPage: React.FC = () => {
  const { t } = useTranslation(['board', 'common']);
  const { boardId } = useParams<{ boardId: string }>();
  const numericBoardId = parseInt(boardId ?? '0', 10);

  if (!numericBoardId) {
    return (
      <div style={{ padding: UI_CONSTANTS.BOARD_LOADING_PADDING, textAlign: 'center' }}>
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
