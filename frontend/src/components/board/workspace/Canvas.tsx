import React from 'react';

import type { TOOL_LIST } from 'constants/BoardConstants';
import { CANVAS_CONFIG } from 'constants/BoardConstants';
import { useCanvas } from 'hooks/board/workspace/canvas/useCanvas';
import type { ActionPayload, SendBoardActionRequest } from 'types/BoardObjectTypes';

import styles from './Canvas.module.css';

type Tool = (typeof TOOL_LIST)[number];

interface CanvasProps {
    instanceId: string;
    onDraw: (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => void;
    objects: ActionPayload[];
    tool: Tool;
    strokeColor: string;
    strokeWidth: number;
}

const Canvas: React.FC<CanvasProps> = (props) => {
    const { mainCanvasRef, previewCanvasRef, containerRef, dimensions, handleMouseDown } = useCanvas(props);

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
                className={styles.previewCanvas}
            />
        </div>
    );
};

export default Canvas;
