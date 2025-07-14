// File: frontend/src/pages/BoardPage.tsx

import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useBoardContext } from '../hooks/useBoardContext';
import Canvas from '../components/board/Canvas';
import Toolbar from '../components/board/Toolbar';
import ChatWindow from '../components/chat/ChatWindow';
import { DEFAULT_DRAWING_CONFIG, TOOLS, type TOOL_LIST } from '../constants/board.constants';
import styles from './BoardPage.module.css';

type Tool = typeof TOOL_LIST[number];

const BoardPage: React.FC = () => {
    const { t } = useTranslation();
    const { boardId: boardIdString } = useParams<{ boardId: string }>();
    const boardId = parseInt(boardIdString || '0', 10);
    const pageRef = useRef<HTMLDivElement>(null);

    const {
        isLoading,
        initialObjects,
        lastReceivedAction,
        messages,
        instanceId,
        handleDrawAction,
    } = useBoardContext();

    const [tool, setTool] = useState<Tool>(TOOLS.BRUSH);
    const [strokeColor, setStrokeColor] = useState<string>(DEFAULT_DRAWING_CONFIG.STROKE_COLOR);
    const [strokeWidth, setStrokeWidth] = useState<number>(DEFAULT_DRAWING_CONFIG.STROKE_WIDTH);

    if (isLoading) {
        return <div>{t('boardPage.loading')}</div>;
    }

    return (
        <div className={styles.page} ref={pageRef}>
            <h1 className={styles.header}>{t('boardPage.heading', { boardId })}</h1>
            
            <Toolbar 
                containerRef={pageRef}
                strokeColor={strokeColor}
                setStrokeColor={setStrokeColor}
                strokeWidth={strokeWidth}
                setStrokeWidth={setStrokeWidth}
                tool={tool}
                setTool={setTool}
            />

            <div className={styles.mainContent}>
                <div className={styles.canvasContainer}>
                    <Canvas 
                        boardId={boardId}
                        instanceId={instanceId}
                        onDraw={(action) => handleDrawAction({ type: action.type, payload: action.payload })}
                        receivedAction={lastReceivedAction}
                        initialObjects={initialObjects}
                        tool={tool}
                        strokeColor={strokeColor}
                        strokeWidth={strokeWidth}
                    />
                </div>
                <div className={styles.chatContainer}>
                    <ChatWindow 
                        boardId={boardId}
                        messages={messages} 
                    />
                </div>
            </div>
        </div>
    );
};

export default BoardPage;