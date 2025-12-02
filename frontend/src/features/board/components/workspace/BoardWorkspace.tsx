import clsx from 'clsx';
import type { ActionPayload, SendBoardActionRequest } from 'features/board/types/BoardObjectTypes';
import type { CanvasConfig } from 'features/board/types/BoardTypes';
import { ChatWindow, MobileChatDrawer } from 'features/chat/components';
import type { ChatMessageResponse } from 'features/chat/types/MessageTypes';
import { useCanvasPreferences } from 'features/settings/CanvasPreferencesProvider';
import { useUserBoardPreferences } from 'features/settings/UserBoardPreferencesProvider';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    type ImperativePanelGroupHandle,
    type ImperativePanelHandle,
    Panel,
    PanelGroup,
    PanelResizeHandle,
} from 'react-resizable-panels';
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
  /** Mobile chat open state (controlled from parent on mobile) */
  mobileChatOpen?: boolean;
  /** Handler for mobile chat open state changes */
  onMobileChatOpenChange?: (isOpen: boolean) => void;
  /** Real-time handler for split ratio changes during resize (not debounced) */
  onLiveSplitRatioChange?: (ratio: number) => void;
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
  splitRatio,
  onDraw,
  onSplitRatioChange,
  onColorPick,
  isLoading,
  mobileChatOpen = false,
  onMobileChatOpenChange,
  onLiveSplitRatioChange,
}) => {
  const isMobile = useIsMobile();
  const { preferences: canvasPreferences, updateCanvasPreferences } = useCanvasPreferences();
  const { preferences: userBoardPreferences } = useUserBoardPreferences();

  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
  const chatPanelRef = useRef<ImperativePanelHandle>(null);

  // State for the canvas panel size (percentage)
  const [localCanvasSize, setLocalCanvasSize] = useState(
    splitRatio ?? canvasPreferences.canvasChatSplitRatio ?? 70,
  );

  // Determine if chat is open
  // On mobile: use prop (controlled by parent, always starts closed)
  // On desktop: use user preferences
  const isChatOpen = isMobile ? mobileChatOpen : canvasPreferences.isChatOpen;

  // Effect to update localCanvasSize when splitRatio prop changes
  useEffect(() => {
    if (splitRatio !== undefined && splitRatio !== localCanvasSize) {
      setLocalCanvasSize(splitRatio);
    }
  }, [splitRatio, localCanvasSize]);

  // Effect to manage chat panel visibility based on `isChatOpen`
  useEffect(() => {
    const chatPanel = chatPanelRef.current;
    if (chatPanel) {
      if (isChatOpen) {
        // Restore chat panel to its last known size or default
        let lastChatSize = 100 - (canvasPreferences.canvasChatSplitRatio ?? 70);
        // Safety check: If saved size is too small (e.g. < 10%), force default 30%
        if (lastChatSize < 10) {
          lastChatSize = 30;
        }
        chatPanel.resize(lastChatSize);
      } else {
        // Collapse chat panel
        chatPanel.collapse();
      }
    }
  }, [isChatOpen, canvasPreferences.canvasChatSplitRatio]);

  // Callback to get the user's chosen color for the background
  const getUserChosenColor = useCallback(() => {
    const savedVariable = userBoardPreferences.boardBackgroundSetting;
    if (!savedVariable) {
      return 'var(--color-surface)';
    }
    return `var(${savedVariable})`;
  }, [userBoardPreferences.boardBackgroundSetting]);

  // Debounced save for split ratio to prevent excessive API calls
  const debouncedSave = useDebouncedCallback((ratio: number) => {
    updateCanvasPreferences({ canvasChatSplitRatio: ratio });
    onSplitRatioChange?.(ratio);
  }, PANEL_CONSTRAINTS.SAVE_DEBOUNCE_MS);

  // Handler for panel resize events
  const handlePanelResize = useCallback(
    (sizes: number[]) => {
      // Only save if chat is currently open.
      // If chat is closed, the canvas will be 100% and chat 0%,
      // which is handled by the onCollapse event and shouldn't trigger a save here.
      if (!isChatOpen) return;

      // sizes is an array of percentages for each panel
      // Canvas is first panel in LTR (left), Chat is second
      const canvasSize = sizes[0];

      if (canvasSize !== undefined) {
        // Update local state immediately for smooth UI
        setLocalCanvasSize(canvasSize);

        // Notify parent of real-time size changes (for toolbar positioning)
        onLiveSplitRatioChange?.(canvasSize);

        // Guard: Don't save if chat panel is collapsed or near-collapsed (< 10%)
        // This prevents overwriting the user's preferred open size with "0"
        const chatSize = 100 - canvasSize;
        if (chatSize >= 10) {
          debouncedSave(canvasSize);
        }
      }
    },
    [debouncedSave, isChatOpen, onLiveSplitRatioChange],
  );

  // CSS variables for background styling
  const containerStyle = useMemo(
    () =>
      ({
        '--background-blur': '0px',
        '--background-size': isMobile ? '280px 280px' : '400px 400px',
      }) as React.CSSProperties,
    [isMobile],
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
          isOpen={mobileChatOpen}
          onOpenChange={(isOpen) => onMobileChatOpenChange?.(isOpen)}
          userChosenColor={getUserChosenColor()}
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
        ref={panelGroupRef}
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

        {/* Resize Handle - hidden when chat is collapsed/closed */}
        <PanelResizeHandle
          className={clsx(styles.resizeHandle, {
            [styles.hidden]: !isChatOpen,
          })}
          disabled={!isChatOpen}
        >
          <div className={styles.resizeHandleInner}>
            <div className={styles.handleDot} />
            <div className={styles.handleDot} />
            <div className={styles.handleDot} />
          </div>
        </PanelResizeHandle>

        {/* Chat Panel (Right in LTR, Left in RTL - CSS handles this) */}
        <Panel
          ref={chatPanelRef}
          id="chat-panel"
          order={2}
          defaultSize={100 - localCanvasSize}
          minSize={PANEL_CONSTRAINTS.CHAT_MIN_SIZE}
          maxSize={PANEL_CONSTRAINTS.CHAT_MAX_SIZE}
          collapsedSize={PANEL_CONSTRAINTS.CHAT_COLLAPSED_SIZE}
          collapsible
          onCollapse={() => {
            // When chat collapses, set canvas to 100% and update preference
            // DO NOT save the split ratio here, to preserve the user's preferred open size
            setLocalCanvasSize(100);
            updateCanvasPreferences({ isChatOpen: false });
          }}
          onExpand={() => {
            // When chat expands, update preference
            updateCanvasPreferences({ isChatOpen: true });
          }}
          className={clsx(styles.chatPanel, {
            [styles.hidden]: !isChatOpen,
          })}
        >
          <ChatWindow boardId={boardId} messages={messages} />
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default BoardWorkspace;
