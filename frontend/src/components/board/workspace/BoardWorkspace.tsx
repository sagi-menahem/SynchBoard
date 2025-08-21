import React from 'react';

import { Canvas } from 'components/board/workspace';
import { ChatWindow } from 'components/chat';
import type { ActionPayload, SendBoardActionRequest } from 'types/BoardObjectTypes';
import type { Tool } from 'types/CommonTypes';
import type { ChatMessageResponse } from 'types/MessageTypes';

import styles from './BoardWorkspace.module.css';

interface BoardWorkspaceProps {
    boardId: number;
    instanceId: string;
    objects: ActionPayload[];
    messages: ChatMessageResponse[];
    tool: Tool;
    strokeColor: string;
    strokeWidth: number;
    onDraw: (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => void;
}

const BoardWorkspace: React.FC<BoardWorkspaceProps> = ({
  boardId,
  instanceId,
  objects,
  messages,
  tool,
  strokeColor,
  strokeWidth,
  onDraw,
}) => {
  return (
    <div className={styles.mainContent}>
      <div className={styles.canvasContainer}>
        <Canvas
          instanceId={instanceId}
          onDraw={onDraw}
          objects={objects}
          tool={tool}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
        />
      </div>
      <div className={styles.chatContainer}>
        <ChatWindow boardId={boardId} messages={messages} />
      </div>
    </div>
  );
};

export default BoardWorkspace;
