import React from 'react';

import { CANVAS_CONFIG, TOOLS } from 'features/board/constants/BoardConstants';
import { useCanvas } from 'features/board/hooks/workspace/canvas/useCanvas';
import { useCanvasInteractions } from 'features/board/hooks/workspace/canvas/useCanvasInteractions';
import type { ActionPayload, SendBoardActionRequest } from 'features/board/types/BoardObjectTypes';
import type { CanvasConfig } from 'features/board/types/BoardTypes';
import { useConnectionStatus } from 'features/websocket/hooks/useConnectionStatus';
import { useTranslation } from 'react-i18next';
import type { Tool } from 'shared/types/CommonTypes';


import styles from './Canvas.module.scss';
import TextInputOverlay from './TextInputOverlay';

interface CanvasProps {
    instanceId: string;
    onDraw: (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => void;
    objects: ActionPayload[];
    tool: Tool;
    strokeColor: string;
    strokeWidth: number;
    fontSize: number;
    canvasConfig?: CanvasConfig;
    onColorPick?: (color: string) => void;
    isLoading?: boolean;
}

const Canvas: React.FC<CanvasProps> = (props) => {
  const { t } = useTranslation(['board', 'common']);
  const { shouldShowBanner, shouldBlockFunctionality } = useConnectionStatus();
  
  const { canvasRef, containerRef, handleMouseDown } = useCanvas(props);
  
  const {
    textInput,
    recolorCursor,
    handleCanvasClick,
    handleCanvasMouseMove,
    handleTextSubmit,
    handleTextCancel,
    getBackgroundStyle,
  } = useCanvasInteractions({
    tool: props.tool,
    strokeColor: props.strokeColor,
    fontSize: props.fontSize,
    instanceId: props.instanceId,
    objects: props.objects,
    canvasRef,
    onDraw: props.onDraw,
    onColorPick: props.onColorPick,
    canvasBackgroundColor: props.canvasConfig?.backgroundColor,
    handleMouseDown,
  });
  
  // Update useCanvas with the text input handler - for now we'll work with the existing pattern

  const canvasConfig = props.canvasConfig ?? {
    backgroundColor: CANVAS_CONFIG.DEFAULT_BACKGROUND_COLOR,
    width: CANVAS_CONFIG.DEFAULT_WIDTH,
    height: CANVAS_CONFIG.DEFAULT_HEIGHT,
  };

  const canvasWidth = canvasConfig.width;
  const canvasHeight = canvasConfig.height;
  const padding = 40;

  const hideBackground = false;

  const canvasContainerStyle = {
    minWidth: `${canvasWidth + padding}px`,
    minHeight: `${canvasHeight + padding}px`,
  };


  const shouldShowLoading = props.isLoading ?? false;
  const containerClassName = `${styles.scrollContainer} ${shouldShowBanner ? styles.disconnected : ''}`;
  const canvasClassName = `${styles.canvas} ${shouldBlockFunctionality ? styles.disabled : ''}`;
  const canvasContainerClassName = `${styles.canvasContainer} ${hideBackground ? styles.hideBackground : ''}`;

  return (
    <div ref={containerRef} className={containerClassName}>
      <div 
        className={canvasContainerClassName}
        style={{ 
          ...getBackgroundStyle(),
          ...canvasContainerStyle,
        }}
      >
        <div 
          className={styles.canvasWrapper} 
          style={{ 
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
          }}
        >
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            onMouseDown={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            className={canvasClassName}
            style={{ 
              backgroundColor: canvasConfig.backgroundColor,
              cursor: props.tool === TOOLS.RECOLOR ? recolorCursor : 'crosshair',
            }}
          />
          
          {textInput && (
            <TextInputOverlay
              x={textInput.x}
              y={textInput.y}
              width={textInput.width}
              height={textInput.height}
              color={props.strokeColor}
              fontSize={props.fontSize}
              onSubmit={handleTextSubmit}
              onCancel={handleTextCancel}
            />
          )}
        </div>
      </div>
      {shouldShowLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.placeholderContent}>
            <div className={styles.placeholderSpinner} />
            <p className={styles.placeholderText}>{t('board:canvas.loading')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;
