// File: frontend/src/pages/BoardPage.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useBoardContext } from '../hooks/useBoardContext';

import BoardCanvas from '../components/board/Canvas';
import Toolbar from '../components/board/Toolbar';
import ChatWindow from '../components/chat/ChatWindow';

const BoardPage: React.FC = () => {
    const { t } = useTranslation();
    const {
        isLoading,
        initialObjects,
        lastReceivedAction,
        messages,
        instanceId,
        boardId,
        tool,
        setTool,
        strokeColor,
        setStrokeColor,
        strokeWidth,
        setStrokeWidth,
        handleDrawAction,
    } = useBoardContext();

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
