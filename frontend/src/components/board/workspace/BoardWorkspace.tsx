import React from 'react';

import { Canvas } from 'components/board/workspace';
import { ChatWindow } from 'components/chat';
import { useWebSocket } from 'hooks/common';
import type { ActionPayload, SendBoardActionRequest } from 'types/BoardObjectTypes';
import type { Tool } from 'types/CommonTypes';
import type { ChatMessageResponse } from 'types/MessageTypes';

import styles from './BoardWorkspace.module.css';

interface BoardWorkspaceProps {
    boardId: number;
    instanceId: string;
    objects: ActionPayload[];
    messages: ChatMessageResponse[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessageResponse[]>>;
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
    setMessages,
    tool,
    strokeColor,
    strokeWidth,
    onDraw,
}) => {
    const { connectionState } = useWebSocket();
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
                    connectionStatus={connectionState}
                />
            </div>
            <div className={styles.chatContainer}>
                <ChatWindow boardId={boardId} messages={messages} setMessages={setMessages} />
            </div>
        </div>
    );
};

export default BoardWorkspace;
