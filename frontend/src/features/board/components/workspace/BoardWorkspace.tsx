import clsx from 'clsx';
import type { ActionPayload, SendBoardActionRequest } from 'features/board/types/BoardObjectTypes';
import type { CanvasConfig } from 'features/board/types/BoardTypes';
import { ChatWindow, MobileChatDrawer } from 'features/chat/components';
import type { ChatMessageResponse } from 'features/chat/types/MessageTypes';
import { useCanvasPreferences } from 'features/settings/CanvasPreferencesProvider';
import { useUserBoardPreferences } from 'features/settings/UserBoardPreferencesProvider';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useDebouncedCallback, useIsMobile } from 'shared/hooks';
import type { Tool } from 'shared/types/CommonTypes';
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
  const isMobile = useIsMobile();
  const { preferences } = useUserBoardPreferences();
  const { preferences: canvasPreferences, updateCanvasPreferences } = useCanvasPreferences();

  const isChatOpen = canvasPreferences.isChatOpen ?? true;
  const chatPanelRef = useRef<ImperativePanelHandle>(null);

  // Local state for immediate UI feedback during resize
  const [localCanvasSize, setLocalCanvasSize] = useState(splitRatio);

  // Sync local state when prop changes (e.g., from server)
  useEffect(() => {
    setLocalCanvasSize(splitRatio);
  }, [splitRatio]);

  // Force expand panel when opening if it was collapsed
  useEffect(() => {
    if (isChatOpen) {
      const panel = chatPanelRef.current;
      if (panel && localCanvasSize > 95) {
        // Default to 30% width for chat if it was collapsed
        panel.resize(30);
      }
    }
  }, [isChatOpen, localCanvasSize]);

  // Debounced save to prevent API flooding during resize
  const debouncedSave = useDebouncedCallback(
    (canvasSize: number) => {
      onSplitRatioChange?.(canvasSize);
    },
    PANEL_CONSTRAINTS.SAVE_DEBOUNCE_MS,
  );

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
      // If chat is closed, we don't want to save the 100% canvas size
      // as it would overwrite the user's preferred split ratio
      if (!isChatOpen) return;

      // sizes is an array of percentages for each panel
      // Canvas is first panel in LTR (left), Chat is second
      const canvasSize = sizes[0];

      if (canvasSize !== undefined) {
        // Update local state immediately for smooth UI
        setLocalCanvasSize(canvasSize);
        // Debounce the actual save to prevent API flooding
        debouncedSave(canvasSize);
      }
    },
    [debouncedSave, isChatOpen],
  );

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

        <MobileChatDrawer
          boardId={boardId}
          messages={messages}
          isOpen={isChatOpen}
          onOpenChange={(isOpen) => void updateCanvasPreferences({ isChatOpen: isOpen })}
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
          id="canvas-panel"
          order={1}
          defaultSize={localCanvasSize}
          minSize={100 - PANEL_CONSTRAINTS.CHAT_MAX_SIZE}
          className={styles.canvasPanel}
        >
          {canvasComponent}
        </Panel>

        {isChatOpen && (
          <>
            {/* Resize Handle - hidden when chat is collapsed/closed */}
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
              id="chat-panel"
              order={2}
              defaultSize={100 - localCanvasSize}
              minSize={PANEL_CONSTRAINTS.CHAT_MIN_SIZE}
              maxSize={PANEL_CONSTRAINTS.CHAT_MAX_SIZE}
              collapsible
              collapsedSize={0}
              onCollapse={() => updateCanvasPreferences({ isChatOpen: false })}
              className={styles.chatPanel}
            >
              <ChatWindow boardId={boardId} messages={messages} />
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  );
};

export default BoardWorkspace;
