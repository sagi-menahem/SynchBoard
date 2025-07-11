// File: frontend/src/pages/BoardPage.tsx

import React from 'react';
import { useBoardContext } from '../hooks/useBoardContext';

import Canvas from '../components/board/Canvas';
import Toolbar from '../components/board/Toolbar';
import ChatWindow from '../components/chat/ChatWindow';

const BoardPage: React.FC = () => {
    // All the logic is gone. We just consume the ready-made data from the context.
    const {
        isLoading,
        initialObjects,
        lastReceivedAction,
        messages,
        instanceId,
        boardId, // We can get the boardId from the context now
        tool,
        setTool,
        strokeColor,
        setStrokeColor,
        strokeWidth,
        setStrokeWidth,
        handleDrawAction,
    } = useBoardContext(); // 2. Use the context hook instead of useBoard

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
                        // The onDraw prop now needs to be adapted slightly since handleDrawAction is memoized in the hook
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