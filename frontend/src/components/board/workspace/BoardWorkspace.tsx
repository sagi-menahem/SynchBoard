import React, { useState, useCallback } from 'react';

import { Canvas } from 'components/board/workspace';
import { ChatWindow } from 'components/chat';
import { ResizableSplitPanel } from 'components/common';
import type { ActionPayload, SendBoardActionRequest } from 'types/BoardObjectTypes';
import type { CanvasConfig } from 'types/BoardTypes';
import type { Tool } from 'types/CommonTypes';
import type { ChatMessageResponse } from 'types/MessageTypes';

import styles from './BoardWorkspace.module.css';

export type LayoutMode = 'focus-canvas' | 'balanced' | 'focus-chat';

interface BoardWorkspaceProps {
    boardId: number;
    instanceId: string;
    objects: ActionPayload[];
    messages: ChatMessageResponse[];
    tool: Tool;
    strokeColor: string;
    strokeWidth: number;
    canvasConfig?: CanvasConfig;
    zoomLevel?: number;
    splitRatio?: number;
    onDraw: (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => void;
    onSplitRatioChange?: (ratio: number) => void;
}

const BoardWorkspace: React.FC<BoardWorkspaceProps> = ({
  boardId,
  instanceId,
  objects,
  messages,
  tool,
  strokeColor,
  strokeWidth,
  canvasConfig,
  zoomLevel,
  splitRatio = 70,
  onDraw,
  onSplitRatioChange,
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
      canvasConfig={canvasConfig}
      zoomLevel={zoomLevel}
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
