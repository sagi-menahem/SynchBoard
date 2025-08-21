import React from 'react';

import { CANVAS_CONFIG } from 'constants/BoardConstants';
import { useCanvas } from 'hooks/board/workspace/canvas/useCanvas';
import { useSocket } from 'hooks/common';
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
  const { canvasRef, containerRef, dimensions, handleMouseDown } = useCanvas(props);
  const { isSocketConnected } = useSocket();

  const containerClassName = `${styles.container} ${!isSocketConnected ? styles.disconnected : ''}`;
  const canvasClassName = `${styles.canvas} ${!isSocketConnected ? styles.disabled : ''}`;

  return (
    <div ref={containerRef} className={containerClassName}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        className={canvasClassName}
        style={{ backgroundColor: CANVAS_CONFIG.BACKGROUND_COLOR }}
      />
    </div>
  );
};

export default Canvas;
