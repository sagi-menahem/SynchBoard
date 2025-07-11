// File: frontend/src/pages/BoardPage.tsx

import React from 'react';
import { useBoardContext } from '../hooks/useBoardContext';

import Canvas from '../components/board/Canvas';
import Toolbar from '../components/board/Toolbar';
import ChatWindow from '../components/chat/ChatWindow';

const BoardPage: React.FC = () => {
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
        return <div>Loading board...</div>;
    }

    return (
        <div style={pageStyle}>
            <h1>Board Workspace (ID: {boardId})</h1>
            <Toolbar 
                strokeColor={strokeColor}
                setStrokeColor={setStrokeColor}
                strokeWidth={strokeWidth}
                setStrokeWidth={setStrokeWidth}
                tool={tool}
                setTool={setTool}
            />
            <div style={mainContentStyle}>
                <div style={canvasContainerStyle}>
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
                <div style={{ flex: 1 }}>
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
const pageStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', height: '90vh', width: '100%' };
const mainContentStyle: React.CSSProperties = { display: 'flex', flex: 1, gap: '1rem', marginTop: '1rem' };
const canvasContainerStyle: React.CSSProperties = { position: 'relative', flex: 3 };

export default BoardPage;