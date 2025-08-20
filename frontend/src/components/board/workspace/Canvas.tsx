import React from 'react';

import { CANVAS_CONFIG } from 'constants/BoardConstants';
import { useCanvas } from 'hooks/board/workspace/canvas/useCanvas';
import { useWebSocket } from 'hooks/common/useSocket';
import type { ActionPayload, SendBoardActionRequest } from 'types/BoardObjectTypes';
import type { Tool } from 'types/CommonTypes';

import styles from './Canvas.module.css';

interface CanvasProps {
    instanceId: string;
    onDraw: (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => void;
    objects: ActionPayload[];
    tool: Tool;
    strokeColor: string;
    strokeWidth: number;
}

const Canvas: React.FC<CanvasProps> = (props) => {
    const { isSocketConnected } = useWebSocket();
    const { mainCanvasRef, previewCanvasRef, containerRef, dimensions, handleMouseDown } = useCanvas({
        ...props,
        isConnected: isSocketConnected,
    });

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
                className={isSocketConnected ? styles.previewCanvas : styles.previewCanvasDisabled}
            />
        </div>
    );
};

export default React.memo(Canvas);
