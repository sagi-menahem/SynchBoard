import React, { useCallback, useState } from 'react';

import type { ActionPayload, SendBoardActionRequest } from 'features/board/types/BoardObjectTypes';
import type { CanvasConfig } from 'features/board/types/BoardTypes';
import { ResizableSplitPanel } from 'features/board/ui';
import { ChatWindow } from 'features/chat/components';
import type { ChatMessageResponse } from 'features/chat/types/MessageTypes';
import type { Tool } from 'shared/types/CommonTypes';

import styles from './BoardWorkspace.module.css';

import { Canvas } from '.';

export type LayoutMode = 'focus-canvas' | 'balanced' | 'focus-chat';

interface BoardWorkspaceProps {
    boardId: number;
    instanceId: string;
    objects: ActionPayload[];
    messages: ChatMessageResponse[];
    tool: Tool;
    strokeColor: string;
    strokeWidth: number;
    fontSize: number;
    canvasConfig?: CanvasConfig;
    splitRatio?: number;
    onDraw: (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => void;
    onSplitRatioChange?: (ratio: number) => void;
    onColorPick?: (color: string) => void;
    isLoading?: boolean;
}

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

  const handleSplitChange = useCallback((ratio: number) => {
    setCurrentSplitRatio(ratio);
    onSplitRatioChange?.(ratio);
  }, [onSplitRatioChange]);

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

  const chatComponent = (
    <ChatWindow boardId={boardId} messages={messages} />
  );

  return (
    <div className={styles.mainContent}>
      <ResizableSplitPanel
        leftChild={canvasComponent}
        rightChild={chatComponent}
        initialSplitRatio={effectiveSplitRatio}
        minRightWidth={300}
        onSplitChange={handleSplitChange}
      />
    </div>
  );
};

export default BoardWorkspace;
