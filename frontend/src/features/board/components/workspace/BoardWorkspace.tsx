import clsx from 'clsx';
import type { ActionPayload, SendBoardActionRequest } from 'features/board/types/BoardObjectTypes';
import type { CanvasConfig } from 'features/board/types/BoardTypes';
import { ChatWindow, MobileChatDrawer } from 'features/chat/components';
import type { ChatMessageResponse } from 'features/chat/types/MessageTypes';
import { useCanvasPreferences } from 'features/settings/CanvasPreferencesProvider';
import { useUserBoardPreferences } from 'features/settings/UserBoardPreferencesProvider';
import { MessageCircle, PanelRightClose, PanelRightOpen } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useDebouncedCallback, useIsMobile } from 'shared/hooks';
import type { Tool } from 'shared/types/CommonTypes';
import { FloatingActionButton } from 'shared/ui';
import Button from 'shared/ui/components/forms/Button';
import utilStyles from 'shared/ui/styles/utils.module.scss';

import styles from './BoardWorkspace.module.scss';

import { Canvas } from '.';

/**
 * Panel size constraints for the desktop split view.
 * Chat panel range: 30%-70% when open, or 0% when collapsed.
 * This prevents the "dead zone" (10%-29%) where chat UI breaks.
 */
const PANEL_CONSTRAINTS = {
  /** Minimum chat panel size when expanded (percentage) */
  CHAT_MIN_SIZE: 30,
  /** Maximum chat panel size (percentage) */
  CHAT_MAX_SIZE: 70,
  /** Chat panel size when collapsed (percentage) */
  CHAT_COLLAPSED_SIZE: 0,
  /** Debounce delay for saving split ratio to prevent API flooding (ms) */
  SAVE_DEBOUNCE_MS: 1000,
} as const;

/**
 * Layout mode configurations for the board workspace split panel.
 * Defines different focus states for the canvas and chat sections.
 */
export type LayoutMode = 'focus-canvas' | 'balanced' | 'focus-chat';

/**
 * Props interface for BoardWorkspace component.
 * Defines the board data, drawing tools state, and interaction handlers for the workspace.
 */
interface BoardWorkspaceProps {
  /** Unique identifier for the current board */
  boardId: number;
  /** Unique instance identifier for this workspace session */
  instanceId: string;
  /** Array of drawing objects/actions to render on the canvas */
  objects: ActionPayload[];
  /** Array of chat messages to display in the chat panel */
  messages: ChatMessageResponse[];
  /** Currently selected drawing tool */
  tool: Tool;
  /** Current stroke color for drawing operations */
  strokeColor: string;
  /** Current stroke width for drawing operations */
  strokeWidth: number;
  /** Current font size for text tools */
  fontSize: number;
  /** Canvas configuration including dimensions and background */
  canvasConfig?: CanvasConfig;
  /** Initial split ratio between canvas and chat (percentage for left panel) */
  splitRatio?: number;
  /** Handler for drawing actions performed on the canvas */
  onDraw: (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => void;
  /** Handler for split panel ratio changes */
  onSplitRatioChange?: (ratio: number) => void;
  /** Handler for color picking interactions on the canvas */
  onColorPick?: (color: string) => void;
  /** Whether the workspace is in a loading state */
  isLoading?: boolean;
}

/**
 * Main workspace component combining canvas and chat with responsive layout.
 * On desktop: Uses react-resizable-panels for a professional split view.
 * On mobile: Full-screen canvas with a bottom sheet drawer for chat.
 *
 * @param boardId - Unique identifier for the current board
 * @param instanceId - Unique instance identifier for this workspace session
 * @param objects - Array of drawing objects/actions to render on the canvas
 * @param messages - Array of chat messages to display in the chat panel
 * @param tool - Currently selected drawing tool
 * @param strokeColor - Current stroke color for drawing operations
 * @param strokeWidth - Current stroke width for drawing operations
 * @param fontSize - Current font size for text tools
 * @param canvasConfig - Canvas configuration including dimensions and background
 * @param splitRatio - Initial split ratio between canvas and chat (percentage for left panel)
 * @param onDraw - Handler for drawing actions performed on the canvas
 * @param onSplitRatioChange - Handler for split panel ratio changes
 * @param onColorPick - Handler for color picking interactions on the canvas
 * @param isLoading - Whether the workspace is in a loading state
 */
const BoardWorkspace: React.FC<BoardWorkspaceProps> = ({
  boardId,
  instanceId,
  objects,
  messages,
  tool,
  strokeColor,
  strokeWidth,
  fontSize,
  canvasConfig,
  splitRatio = 70,
  onDraw,
  onSplitRatioChange,
  onColorPick,
  isLoading,
}) => {
  const { t } = useTranslation(['board', 'chat']);
  const isMobile = useIsMobile();
  const { preferences } = useUserBoardPreferences();
  const { preferences: canvasPreferences, updateCanvasPreferences } = useCanvasPreferences();

  // Mobile chat drawer state
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // Desktop chat panel ref for programmatic collapse/expand
  const chatPanelRef = useRef<ImperativePanelHandle>(null);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [hasInitializedChatState, setHasInitializedChatState] = useState(false);

  // Local state for immediate UI feedback during resize
  const [localCanvasSize, setLocalCanvasSize] = useState(splitRatio);

  // Sync local state when prop changes (e.g., from server)
  useEffect(() => {
    setLocalCanvasSize(splitRatio);
  }, [splitRatio]);

  // Initialize chat panel state from backend preferences on mount
  useEffect(() => {
    if (hasInitializedChatState || isMobile) return;

    const panel = chatPanelRef.current;
    if (!panel) return;

    // Read isChatOpen from backend preferences (defaults to true)
    const shouldBeClosed = canvasPreferences.isChatOpen === false;

    if (shouldBeClosed) {
      // Collapse the panel if user had it closed
      panel.collapse();
      setIsChatCollapsed(true);
    }

    setHasInitializedChatState(true);
  }, [canvasPreferences.isChatOpen, hasInitializedChatState, isMobile]);

  // Debounced save to prevent API flooding during resize
  const debouncedSave = useDebouncedCallback(
    (canvasSize: number) => {
      onSplitRatioChange?.(canvasSize);
    },
    PANEL_CONSTRAINTS.SAVE_DEBOUNCE_MS,
  );

  // Get user's chosen background color from preferences (moved from ResizableSplitPanel)
  const getUserChosenColor = useCallback(() => {
    const savedVariable = preferences.boardBackgroundSetting;
    if (!savedVariable) {
      return 'var(--color-surface)';
    }
    return `var(${savedVariable})`;
  }, [preferences.boardBackgroundSetting]);

  // Handle desktop panel resize - updates local state immediately, debounces API save
  const handlePanelResize = useCallback(
    (sizes: number[]) => {
      // sizes is an array of percentages for each panel
      // Canvas is first panel in LTR (left), Chat is second
      const canvasSize = sizes[0];
      const chatSize = sizes[1];

      // Track collapsed state based on chat panel size
      const isCollapsed = chatSize !== undefined && chatSize < 5;
      setIsChatCollapsed(isCollapsed);

      // CRITICAL: Never save collapsed state (0%) to the backend.
      // This ensures when user expands chat, it restores their preferred size
      // instead of resetting to minSize. Only save valid sizes (30-70).
      if (isCollapsed) {
        return;
      }

      if (canvasSize !== undefined) {
        // Update local state immediately for smooth UI
        setLocalCanvasSize(canvasSize);
        // Debounce the actual save to prevent API flooding
        debouncedSave(canvasSize);
      }
    },
    [debouncedSave],
  );

  // Toggle chat panel collapse/expand using the panel's API directly
  const handleToggleChat = useCallback(() => {
    const panel = chatPanelRef.current;
    if (!panel) return;

    // Use the panel's isCollapsed() method for accurate state
    const isCurrentlyCollapsed = panel.isCollapsed();
    if (isCurrentlyCollapsed) {
      panel.expand();
      // Persist "open" state to backend
      void updateCanvasPreferences({ isChatOpen: true });
    } else {
      panel.collapse();
      // Persist "closed" state to backend
      void updateCanvasPreferences({ isChatOpen: false });
    }
  }, [updateCanvasPreferences]);

  // CSS variables for background styling
  const containerStyle = useMemo(
    () =>
      ({
        '--user-chosen-color': getUserChosenColor(),
        '--background-blur': '0px',
      }) as React.CSSProperties,
    [getUserChosenColor],
  );

  // Canvas component (shared between mobile and desktop)
  const canvasComponent = (
    <Canvas
      instanceId={instanceId}
      onDraw={onDraw}
      objects={objects}
      tool={tool}
      strokeColor={strokeColor}
      strokeWidth={strokeWidth}
      fontSize={fontSize}
      canvasConfig={canvasConfig}
      onColorPick={onColorPick}
      isLoading={isLoading}
    />
  );

  // Mobile Layout: Full-screen canvas with FAB and drawer
  if (isMobile) {
    return (
      <div
        className={clsx(styles.mainContent, styles.mobileLayout, utilStyles.unifiedDotBackground)}
        style={containerStyle}
      >
        <div className={styles.mobileCanvasContainer}>{canvasComponent}</div>

        <FloatingActionButton
          icon={MessageCircle}
          onClick={() => setIsMobileChatOpen(true)}
          aria-label={t('chat:window.title')}
          badge={messages.length > 0 ? undefined : undefined}
          position="bottom-right"
        />

        <MobileChatDrawer
          boardId={boardId}
          messages={messages}
          isOpen={isMobileChatOpen}
          onOpenChange={setIsMobileChatOpen}
        />
      </div>
    );
  }

  // Desktop Layout: Resizable split panels
  return (
    <div
      className={clsx(styles.mainContent, utilStyles.unifiedDotBackground)}
      style={containerStyle}
    >
      {/* Chat Toggle Button - floats in top-right of workspace */}
      <Button
        variant="icon"
        onClick={handleToggleChat}
        className={styles.chatToggleButton}
        title={isChatCollapsed ? t('board:workspace.showChat') : t('board:workspace.hideChat')}
        aria-label={isChatCollapsed ? t('board:workspace.showChat') : t('board:workspace.hideChat')}
        aria-expanded={!isChatCollapsed}
      >
        {isChatCollapsed ? <PanelRightOpen size={20} /> : <PanelRightClose size={20} />}
      </Button>

      <PanelGroup
        direction="horizontal"
        onLayout={handlePanelResize}
        className={styles.panelGroup}
      >
        {/* Canvas Panel (Left in LTR, Right in RTL - CSS handles this) */}
        {/* minSize=30 ensures canvas never shrinks below 30% (when chat is at max 70%) */}
        {/* NO maxSize - allows canvas to expand to 100% when chat collapses to 0% */}
        {/* Chat's minSize=30 naturally prevents canvas from exceeding 70% during normal drag */}
        <Panel
          defaultSize={localCanvasSize}
          minSize={100 - PANEL_CONSTRAINTS.CHAT_MAX_SIZE}
          className={styles.canvasPanel}
        >
          {canvasComponent}
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle className={styles.resizeHandle}>
          <div className={styles.resizeHandleInner}>
            <div className={styles.handleDot} />
            <div className={styles.handleDot} />
            <div className={styles.handleDot} />
          </div>
        </PanelResizeHandle>

        {/* Chat Panel (Right in LTR, Left in RTL - CSS handles this) */}
        {/* Chat range: 30%-70% when open, snaps to 0% when collapsed */}
        <Panel
          ref={chatPanelRef}
          defaultSize={100 - localCanvasSize}
          minSize={PANEL_CONSTRAINTS.CHAT_MIN_SIZE}
          maxSize={PANEL_CONSTRAINTS.CHAT_MAX_SIZE}
          collapsible
          collapsedSize={PANEL_CONSTRAINTS.CHAT_COLLAPSED_SIZE}
          onCollapse={() => setIsChatCollapsed(true)}
          onExpand={() => setIsChatCollapsed(false)}
          className={clsx(styles.chatPanel, isChatCollapsed && styles.collapsed)}
        >
          <ChatWindow boardId={boardId} messages={messages} />
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default BoardWorkspace;
