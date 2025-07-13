// File: frontend/src/pages/BoardPage.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom'; // Import useParams
import { useBoardContext } from '../hooks/useBoardContext';
import BoardCanvas from '../components/board/Canvas';
import Toolbar from '../components/board/Toolbar';
import ChatWindow from '../components/chat/ChatWindow';
import { DEFAULT_DRAWING_CONFIG, TOOLS, type TOOL_LIST } from '../constants/board.constants';

type Tool = typeof TOOL_LIST[number];

const BoardPage: React.FC = () => {
    const { t } = useTranslation();
    
    // Step 1: Get boardId directly from the URL
    const { boardId: boardIdString } = useParams<{ boardId: string }>();
    const boardId = parseInt(boardIdString || '0', 10);

    // Step 2: Consume the context, which no longer contains boardId
    const {
        isLoading,
        initialObjects,
        lastReceivedAction,
        messages,
        instanceId,
        handleDrawAction,
    } = useBoardContext();

    // UI state for the toolbar is managed directly here
    const [tool, setTool] = useState<Tool>(TOOLS.BRUSH);
    const [strokeColor, setStrokeColor] = useState<string>(DEFAULT_DRAWING_CONFIG.STROKE_COLOR);
    const [strokeWidth, setStrokeWidth] = useState<number>(DEFAULT_DRAWING_CONFIG.STROKE_WIDTH);

    if (isLoading) {
        return <div>{t('boardPage.loading')}</div>;
    }

    return (
        <div style={pageStyle}>
            <h1 style={{ textAlign: 'left', alignSelf: 'flex-start', width: '100%' }}>{t('boardPage.heading', { boardId })}</h1>
            <div style={mainContentStyle}>
                <div style={canvasContainerStyle}>
                    <Toolbar 
                        strokeColor={strokeColor}
                        setStrokeColor={setStrokeColor}
                        strokeWidth={strokeWidth}
                        setStrokeWidth={setStrokeWidth}
                        tool={tool}
                        setTool={setTool}
                    />
                    <BoardCanvas 
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
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <ChatWindow 
                        boardId={boardId}
                        messages={messages} 
                    />
                </div>
            </div>
        </div>
    );
};

// Styles for this page
const pageStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', height: '100%', width: '100%', alignItems: 'center' };
const mainContentStyle: React.CSSProperties = { display: 'flex', flex: 1, gap: '1rem', marginTop: '1rem', width: '100%', overflow: 'hidden' };
const canvasContainerStyle: React.CSSProperties = { position: 'relative', flex: 3 };

export default BoardPage;