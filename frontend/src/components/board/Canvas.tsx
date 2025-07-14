// File: frontend/src/components/board/Canvas.tsx

import React from 'react';
import type { SendBoardActionRequest, ActionPayload } from '../../types/boardObject.types';
import { CANVAS_CONFIG } from '../../constants/board.constants';
import { useCanvas } from '../../hooks/useCanvas';
import type { TOOL_LIST } from '../../constants/board.constants';
import styles from './Canvas.module.css';

type Tool = typeof TOOL_LIST[number];

// UPDATED PROPS
interface BoardCanvasProps {
    instanceId: string;
    onDraw: (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => void;
    objects: ActionPayload[];
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
    } = useCanvas(props); // Pass all props down to the hook

    return (
        <div ref={containerRef} className={styles.container}>
            <canvas
                ref={mainCanvasRef}
                width={dimensions.width}
                height={dimensions.height}
                className={styles.mainCanvas}
                style={{ backgroundColor: CANVAS_CONFIG.BACKGROUND_COLOR }}
            />
            <canvas
                ref={previewCanvasRef}
                width={dimensions.width}
                height={dimensions.height}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseUp}
                className={styles.previewCanvas}
            />
        </div>
    );
};

export default BoardCanvas;