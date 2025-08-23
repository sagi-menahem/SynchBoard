import React, { useEffect, useState } from 'react';

import { CANVAS_CONFIG } from 'constants/BoardConstants';
import { useCanvas } from 'hooks/board/workspace/canvas/useCanvas';
import { useConnectionStatus } from 'hooks/common';
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
  const { shouldShowBanner, shouldBlockFunctionality } = useConnectionStatus();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const shouldShowLoading = showLoading || dimensions.width === 0 || dimensions.height === 0;
  const containerClassName = `${styles.container} ${shouldShowBanner ? styles.disconnected : ''}`;
  const canvasClassName = `${styles.canvas} ${shouldBlockFunctionality ? styles.disabled : ''}`;

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
      {shouldShowLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.placeholderContent}>
            <div className={styles.placeholderSpinner}></div>
            <p className={styles.placeholderText}>Loading canvas...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;
