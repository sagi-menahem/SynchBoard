import React, { useMemo, useRef, useCallback } from 'react';

import { BoardProvider } from 'features/board';
import { BoardWorkspace } from 'features/board/components/workspace';
import { STROKE_WIDTH_RANGE, TOOLS } from 'features/board/constants/BoardConstants';
import { useBoardContext } from 'features/board/hooks/context/useBoardContext';
import type { ToolbarConfig } from 'features/board/types/ToolbarTypes';
import { useCanvasPreferences } from 'features/settings/CanvasPreferencesProvider';
import { useToolPreferences } from 'features/settings/ToolPreferencesProvider';
import {
  Brush,
  Download,
  Eraser,
  Info,
  PaintBucket,
  Pipette,
  Redo,
  Type,
  Undo,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants';
import { UI_CONSTANTS } from 'shared/constants/UIConstants';
import type { Tool } from 'shared/types/CommonTypes';
import {
  ColorPicker,
  PageLoader,
  PageTransition,
  Slider,
  ToolButton,
  ToolGroup,
  UniversalToolbar,
} from 'shared/ui';
import Button from 'shared/ui/components/forms/Button';
import utilStyles from 'shared/ui/styles/utils.module.scss';
import { getNavigationArrowIcon } from 'shared/utils/rtlUtils';

import { LineToolsDropdown } from '../components/workspace/LineToolsDropdown';
import { ShapeToolsDropdown } from '../components/workspace/ShapeToolsDropdown';
import { useCanvasDownload } from '../hooks/useCanvasDownload';

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

  const { preferences, updateTool, updateStrokeColor, updateStrokeWidth } = useToolPreferences();

  const tool = preferences.defaultTool;
  const strokeColor = preferences.defaultStrokeColor;
  const strokeWidth = preferences.defaultStrokeWidth;

  const handleColorPick = (color: string) => {
    void updateStrokeColor(color);
  };

  const { preferences: canvasPreferences, updateSplitRatio } = useCanvasPreferences();

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

  const { handleDownload } = useCanvasDownload({
    boardName: boardName ?? t('board:fallbacks.untitled'),
    canvasConfig,
  });

  const handleToolClick = useCallback(
    (toolName: Tool) => {
      if (toolName === TOOLS.DOWNLOAD) {
        void handleDownload();
      } else {
        void updateTool(toolName);
      }
    },
    [handleDownload, updateTool],
  );

  const toolbarConfig: ToolbarConfig = useMemo(
    () => ({
      pageType: 'canvas',
      leftSection: [
        // COLOR - Always visible
        {
          type: 'custom',
          key: 'color-group',
          content: (
            <ToolGroup label={t('board:toolbar.label.color')}>
              <div className={`${utilStyles.colorPickerPopupWrapper}`}>
                <ColorPicker color={strokeColor} onChange={updateStrokeColor} />
              </div>
            </ToolGroup>
          ),
        },
        // SIZE - Always visible (except for download tool)
        ...(tool !== TOOLS.DOWNLOAD
          ? [
              {
                type: 'custom' as const,
                key: 'size-group',
                content: (
                  <ToolGroup label={t('board:toolbar.label.size')}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        minWidth: UI_CONSTANTS.TOOLBAR_SIZE_CONTROL_MIN_WIDTH,
                        height: UI_CONSTANTS.TOOLBAR_SIZE_CONTROL_HEIGHT,
                        padding: UI_CONSTANTS.TOOLBAR_SIZE_CONTROL_PADDING,
                        background: 'var(--color-surface-elevated)',
                        border: '1px solid var(--color-border-light)',
                        borderRadius: UI_CONSTANTS.TOOLBAR_SIZE_CONTROL_BORDER_RADIUS,
                      }}
                    >
                      <Slider
                        value={strokeWidth}
                        min={tool === TOOLS.TEXT ? 12 : STROKE_WIDTH_RANGE.MIN}
                        max={tool === TOOLS.TEXT ? 48 : STROKE_WIDTH_RANGE.MAX}
                        onChange={updateStrokeWidth}
                        aria-label={t('common:accessibility.sizeSlider', { size: strokeWidth })}
                      />
                    </div>
                  </ToolGroup>
                ),
              },
            ]
          : []),
        // DRAW - Priority 6
        {
          type: 'custom',
          key: 'draw-group',
          className: 'toolbar-priority-6',
          content: (
            <ToolGroup label={t('board:toolbar.label.draw')}>
              <ToolButton
                tool={TOOLS.BRUSH}
                currentTool={tool}
                onClick={handleToolClick}
                title={t('board:toolbar.tool.brush')}
              >
                <Brush size={20} />
              </ToolButton>
              <ToolButton
                tool={TOOLS.ERASER}
                currentTool={tool}
                onClick={handleToolClick}
                title={t('board:toolbar.tool.eraser')}
              >
                <Eraser size={20} />
              </ToolButton>
            </ToolGroup>
          ),
        },
        // SHAPES - Priority 5
        {
          type: 'custom',
          key: 'shapes-group',
          className: 'toolbar-priority-5',
          content: (
            <ToolGroup label={t('board:toolbar.label.shapes')}>
              <ShapeToolsDropdown currentTool={tool} onToolSelect={updateTool} />
            </ToolGroup>
          ),
        },
        // LINES - Priority 4
        {
          type: 'custom',
          key: 'lines-group',
          className: 'toolbar-priority-4',
          content: (
            <ToolGroup label={t('board:toolbar.label.lines')}>
              <LineToolsDropdown currentTool={tool} onToolSelect={updateTool} />
            </ToolGroup>
          ),
        },
        // TOOLS - Priority 3
        {
          type: 'custom',
          key: 'tools-group',
          className: 'toolbar-priority-3',
          content: (
            <ToolGroup label={t('board:toolbar.label.tools')}>
              <ToolButton
                tool={TOOLS.TEXT}
                currentTool={tool}
                onClick={handleToolClick}
                title={t('board:toolbar.tool.text')}
              >
                <Type size={20} />
              </ToolButton>
              <ToolButton
                tool={TOOLS.COLOR_PICKER}
                currentTool={tool}
                onClick={handleToolClick}
                title={t('board:toolbar.tool.colorPicker')}
              >
                <Pipette size={20} />
              </ToolButton>
              <ToolButton
                tool={TOOLS.RECOLOR}
                currentTool={tool}
                onClick={handleToolClick}
                title={t('board:toolbar.tool.recolor')}
              >
                <PaintBucket size={20} />
              </ToolButton>
            </ToolGroup>
          ),
        },
        // HISTORY - Priority 2
        {
          type: 'custom',
          key: 'history-group',
          className: 'toolbar-priority-2',
          content: (
            <ToolGroup label={t('board:toolbar.label.history')}>
              <Button
                variant="icon"
                onClick={handleUndo}
                disabled={!isUndoAvailable}
                title={t('board:toolbar.tool.undo')}
              >
                <Undo size={20} />
              </Button>
              <Button
                variant="icon"
                onClick={handleRedo}
                disabled={!isRedoAvailable}
                title={t('board:toolbar.tool.redo')}
              >
                <Redo size={20} />
              </Button>
            </ToolGroup>
          ),
        },
        // EXPORT - Priority 1 (hides first)
        {
          type: 'custom',
          key: 'export-group',
          className: 'toolbar-priority-1',
          content: (
            <ToolGroup label={t('board:toolbar.label.export')}>
              <Button
                variant="icon"
                onClick={handleDownload}
                title={t('board:toolbar.tool.download')}
              >
                <Download size={20} />
              </Button>
            </ToolGroup>
          ),
        },
      ],
      centerSection: [], // Explicitly empty - no center section for board page
      rightSection: [
        {
          type: 'custom',
          content: (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: UI_CONSTANTS.TOOLBAR_GAP,
                paddingRight: UI_CONSTANTS.TOOLBAR_PADDING_RIGHT,
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: UI_CONSTANTS.SEPARATOR_WIDTH,
                  height: '32px',
                  background:
                    'linear-gradient(to bottom, transparent, var(--color-border-light), transparent)',
                }}
              />
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--color-text-primary)',
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                }}
              >
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
          icon: getNavigationArrowIcon(),
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
      handleToolClick,
      handleDownload,
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
      </main>
    </PageTransition>
  );
};

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
