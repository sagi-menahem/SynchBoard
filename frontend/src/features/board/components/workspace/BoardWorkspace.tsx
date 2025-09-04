import type { ActionPayload, SendBoardActionRequest } from 'features/board/types/BoardObjectTypes';
import type { CanvasConfig } from 'features/board/types/BoardTypes';
import { ResizableSplitPanel } from 'features/board/ui';
import { ChatWindow } from 'features/chat/components';
import type { ChatMessageResponse } from 'features/chat/types/MessageTypes';
import React, { useCallback, useState } from 'react';
import type { Tool } from 'shared/types/CommonTypes';

import styles from './BoardWorkspace.module.scss';

import { Canvas } from '.';

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
 * Main workspace component combining canvas and chat in a resizable split panel layout.
 * This component orchestrates the collaborative whiteboard experience by managing the
 * layout between drawing canvas and real-time chat communication.
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
  const [currentSplitRatio, setCurrentSplitRatio] = useState(splitRatio);

  const getLayoutSplitRatio = useCallback(() => {
    return currentSplitRatio;
  }, [currentSplitRatio]);

  const handleSplitChange = useCallback(
    (ratio: number) => {
      setCurrentSplitRatio(ratio);
      onSplitRatioChange?.(ratio);
    },
    [onSplitRatioChange],
  );

  const effectiveSplitRatio = getLayoutSplitRatio();

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

  const chatComponent = <ChatWindow boardId={boardId} messages={messages} />;

  return (
    <div className={styles.mainContent}>
      <ResizableSplitPanel
        leftChild={canvasComponent}
        rightChild={chatComponent}
        initialSplitRatio={effectiveSplitRatio}
        minLeftWidth={300}
        minRightWidth={300}
        onSplitChange={handleSplitChange}
      />
    </div>
  );
};

export default BoardWorkspace;
