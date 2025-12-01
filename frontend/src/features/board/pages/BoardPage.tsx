import { BoardProvider } from 'features/board';
import { BoardWorkspace } from 'features/board/components/workspace';
import { useBoardContext } from 'features/board/hooks/context/useBoardContext';
import { useCanvasPreferences } from 'features/settings/CanvasPreferencesProvider';
import { useToolPreferences } from 'features/settings/ToolPreferencesProvider';
import { useUserBoardPreferences } from 'features/settings/UserBoardPreferencesProvider';
import { ArrowLeft, Download, Info, MessageSquare } from 'lucide-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants';
import { UI_CONSTANTS } from 'shared/constants/UIConstants';
import { useIsMobile } from 'shared/hooks';
import { AppHeader, Button, PageLoader, PageTransition } from 'shared/ui';
import { hexToRgbString } from 'shared/utils/ColorUtils';

import { FloatingActions } from '../components/workspace/FloatingActions';
import { RadialDock } from '../components/workspace/radial';
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
  const { t } = useTranslation(['board', 'common']);
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const {
    isLoading,
    boardName,
    boardDetails,
    objects,
    messages,
    instanceId,
    handleDrawAction,
  } = useBoardContext();

  const { preferences, updateStrokeColor, updateTool } = useToolPreferences();
  const { preferences: userBoardPreferences } = useUserBoardPreferences();

  // Mobile chat state - always starts closed on mobile
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  // Track satellite state for mobile FloatingActions coordination
  const [activeSatellite, setActiveSatellite] = React.useState<string | null>(null);
  // Track previous tool for auto-switch after color picking
  const previousToolRef = React.useRef<typeof preferences.defaultTool>(preferences.defaultTool);

  // Extract current tool settings from user preferences
  const tool = preferences.defaultTool;
  const strokeColor = preferences.defaultStrokeColor;
  const strokeWidth = preferences.defaultStrokeWidth;

  // Update previous tool ref when tool changes (but not when switching to COLOR_PICKER)
  React.useEffect(() => {
    if (tool !== 'colorPicker' && tool !== previousToolRef.current) {
      previousToolRef.current = tool;
    }
  }, [tool]);

  const handleColorPick = useCallback(async (color: string) => {
    try {
      // Save picked color to preferences
      await updateStrokeColor(color);
      
      // Auto-switch back to previous drawing tool for better workflow
      // Don't switch back if previous tool was eraser or another utility tool
      const drawingTools = ['brush', 'square', 'rectangle', 'circle', 'triangle', 'pentagon', 'hexagon', 'star', 'line', 'dottedLine', 'arrow', 'text'];
      if (drawingTools.includes(previousToolRef.current)) {
        await updateTool(previousToolRef.current);
      }
    } catch (error) {
      console.error('Failed to update picked color:', error);
    }
  }, [updateStrokeColor, updateTool]);

  const { preferences: canvasPreferences, updateSplitRatio, updateCanvasPreferences } = useCanvasPreferences();

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
  // Convert board theme color to CSS custom properties
  // Use user's Board Appearance preference (same as chat background)
  const themeColorStyles = useMemo(() => {
    const savedColor = userBoardPreferences.boardBackgroundSetting;
    
    if (!savedColor) {
      return undefined;
    }
    
    // Check if it's a CSS variable (starts with --)
    if (savedColor.startsWith('--')) {
      // Use the CSS variable directly - no conversion needed
      const bgColor = `var(${savedColor})`;
      
      return {
        '--board-theme-color': bgColor,
        background: bgColor, // Also set directly for immediate application
      } as React.CSSProperties;
    }
    
    // It's a hex color - convert to RGB
    const rgbValue = hexToRgbString(savedColor);
    
    return {
      '--board-theme-color': savedColor,
      '--board-theme-rgb': rgbValue,
    } as React.CSSProperties;
  }, [userBoardPreferences]);

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

  if (isLoading) {
    return (
      <PageTransition>
        <AppHeader
          leading={
            <>
              <Button variant="icon" onClick={handleGoToList} title={t('board:page.boardListButton')}>
                <ArrowLeft size={20} />
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
          <>
            <Button variant="icon" onClick={handleGoToList} title={t('board:page.boardListButton')}>
              <ArrowLeft size={20} />
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
              onClick={() => {
                if (isMobile) {
                  setMobileChatOpen(!mobileChatOpen);
                } else {
                  void updateCanvasPreferences({ isChatOpen: !canvasPreferences.isChatOpen });
                }
              }}
              title={
                (isMobile ? mobileChatOpen : canvasPreferences.isChatOpen)
                  ? t('board:workspace.hideChat')
                  : t('board:workspace.showChat')
              }
              aria-pressed={isMobile ? mobileChatOpen : canvasPreferences.isChatOpen}
            >
              <MessageSquare size={20} />
            </Button>
          </>
        }
      />

      {/* Main Content Area */}
      <main 
        className={styles.pageContent} 
        ref={pageRef} 
        data-board-page
        style={themeColorStyles}
      >
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
            mobileChatOpen={mobileChatOpen}
            onMobileChatOpenChange={setMobileChatOpen}
          />
        </div>

        {/* Floating UI Components */}
        <RadialDock onSatelliteChange={setActiveSatellite} />
        <FloatingActions isSatelliteOpen={!!activeSatellite} />
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
