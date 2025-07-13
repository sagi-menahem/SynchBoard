// File: frontend/src/components/board/BoardCanvas.tsx

import React from 'react';
import type { BoardActionResponse, SendBoardActionRequest } from '../../types/boardObject.types';
import { CANVAS_CONFIG } from '../../constants/board.constants';
import { useBoardCanvas } from '../../hooks/useCanvas';
import type { TOOL_LIST } from '../../constants/board.constants';

type Tool = typeof TOOL_LIST[number];

interface BoardCanvasProps {
    boardId: number;
    instanceId: string;
    onDraw: (action: SendBoardActionRequest) => void;
    receivedAction: BoardActionResponse | null;
    initialObjects: BoardActionResponse[];
    tool: Tool;
    strokeColor: string;
    strokeWidth: number;
}

const BoardCanvas: React.FC<BoardCanvasProps> = (props) => {
    const {
        mainCanvasRef,
        previewCanvasRef,
        containerRef,
        dimensions,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
    } = useBoardCanvas(props);

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas
                ref={mainCanvasRef}
                width={dimensions.width}
                height={dimensions.height}
                style={{ position: 'absolute', top: 0, left: 0, backgroundColor: CANVAS_CONFIG.BACKGROUND_COLOR }}
            />
            <canvas
                ref={previewCanvasRef}
                width={dimensions.width}
                height={dimensions.height}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseUp} // Finish drawing if mouse leaves canvas
                style={{ position: 'absolute', top: 0, left: 0, cursor: CANVAS_CONFIG.CURSOR }}
            />
        </div>
    );
};

export default BoardCanvas;