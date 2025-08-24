import React, { useEffect, useState } from 'react';

import { CANVAS_CONFIG } from 'constants/BoardConstants';
import { useCanvas } from 'hooks/board/workspace/canvas/useCanvas';
import { useConnectionStatus, usePreferences } from 'hooks/common';
import type { ActionPayload, SendBoardActionRequest } from 'types/BoardObjectTypes';
import type { CanvasConfig } from 'types/BoardTypes';
import type { Tool } from 'types/CommonTypes';

import styles from './Canvas.module.css';

interface CanvasProps {
    instanceId: string;
    onDraw: (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => void;
    objects: ActionPayload[];
    tool: Tool;
    strokeColor: string;
    strokeWidth: number;
    canvasConfig?: CanvasConfig;
    zoomLevel?: number;
}

const Canvas: React.FC<CanvasProps> = (props) => {
  const zoomLevel = props.zoomLevel || 100;
  const zoomScale = zoomLevel / 100;
  const { canvasRef, containerRef, handleMouseDown } = useCanvas({ ...props, zoomScale });
  const { shouldShowBanner, shouldBlockFunctionality } = useConnectionStatus();
  const { preferences } = usePreferences();
  const [showLoading, setShowLoading] = useState(true);

  const canvasConfig = props.canvasConfig || {
    backgroundColor: CANVAS_CONFIG.DEFAULT_BACKGROUND_COLOR,
    width: CANVAS_CONFIG.DEFAULT_WIDTH,
    height: CANVAS_CONFIG.DEFAULT_HEIGHT,
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const shouldShowLoading = showLoading;
  const containerClassName = `${styles.scrollContainer} ${shouldShowBanner ? styles.disconnected : ''}`;
  const canvasClassName = `${styles.canvas} ${shouldBlockFunctionality ? styles.disabled : ''}`;

  return (
    <div ref={containerRef} className={containerClassName}>
      <div 
        className={styles.canvasContainer}
        style={{ backgroundColor: preferences.boardBackgroundSetting || undefined }}
      >
        <div 
          className={styles.canvasWrapper} 
          style={{ 
            transform: `scale(${zoomScale})`, 
            transformOrigin: 'center center',
            width: `${canvasConfig.width}px`,
            height: `${canvasConfig.height}px`,
          }}
        >
          <canvas
            ref={canvasRef}
            width={canvasConfig.width}
            height={canvasConfig.height}
            onMouseDown={handleMouseDown}
            className={canvasClassName}
            style={{ backgroundColor: canvasConfig.backgroundColor }}
          />
        </div>
      </div>
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
