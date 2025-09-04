import { CANVAS_CONFIG, TOOLS } from 'features/board/constants/BoardConstants';
import { useCanvas } from 'features/board/hooks/workspace/canvas/useCanvas';
import { useCanvasInteractions } from 'features/board/hooks/workspace/canvas/useCanvasInteractions';
import type { ActionPayload, SendBoardActionRequest } from 'features/board/types/BoardObjectTypes';
import type { CanvasConfig } from 'features/board/types/BoardTypes';
import { useConnectionStatus } from 'features/websocket/hooks/useConnectionStatus';
import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Tool } from 'shared/types/CommonTypes';

import styles from './Canvas.module.scss';
import TextInputOverlay from './TextInputOverlay';

const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  backgroundColor: CANVAS_CONFIG.DEFAULT_BACKGROUND_COLOR,
  width: CANVAS_CONFIG.DEFAULT_WIDTH,
  height: CANVAS_CONFIG.DEFAULT_HEIGHT,
};

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

  const textInputRequestRef = useRef<
    ((x: number, y: number, width: number, height: number) => void) | null
  >(null);

  const { canvasRef, containerRef, handleMouseDown } = useCanvas({
    ...props,
    onTextInputRequest: (x: number, y: number, width: number, height: number) => {
      textInputRequestRef.current?.(x, y, width, height);
    },
  });

  // Memoize canvas interactions config to prevent unnecessary re-renders
  const canvasInteractionsConfig = useMemo(
    () => ({
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
    }),
    [
      props.tool,
      props.strokeColor,
      props.fontSize,
      props.instanceId,
      props.objects,
      canvasRef,
      props.onDraw,
      props.onColorPick,
      props.canvasConfig?.backgroundColor,
      handleMouseDown,
    ],
  );

  const {
    textInput,
    recolorCursor,
    handleTextInputRequest,
    handleCanvasClick,
    handleCanvasMouseMove,
    handleTextSubmit,
    handleTextCancel,
  } = useCanvasInteractions(canvasInteractionsConfig);

  // Connect the text input request handler
  textInputRequestRef.current = handleTextInputRequest;

  // Memoize canvas configuration to prevent unnecessary re-renders
  const canvasConfig = useMemo(
    () => props.canvasConfig ?? DEFAULT_CANVAS_CONFIG,
    [props.canvasConfig],
  );

  // Memoize computed values
  const canvasWidth = canvasConfig.width;
  const canvasHeight = canvasConfig.height;
  const padding = 0; // Removed padding for edge-to-edge canvas
  const hideBackground = false;

  // Memoize style objects to prevent re-renders
  const canvasContainerStyle = useMemo(
    () => ({
      minWidth: `${canvasWidth + padding}px`,
      minHeight: `${canvasHeight + padding}px`,
    }),
    [canvasWidth, canvasHeight, padding],
  );

  const canvasWrapperStyle = useMemo(
    () => ({
      width: `${canvasWidth}px`,
      height: `${canvasHeight}px`,
    }),
    [canvasWidth, canvasHeight],
  );

  const canvasStyle = useMemo(
    () => ({
      backgroundColor: canvasConfig.backgroundColor,
      cursor: props.tool === TOOLS.RECOLOR ? recolorCursor : 'crosshair',
    }),
    [canvasConfig.backgroundColor, props.tool, recolorCursor],
  );

  // Memoize computed flags and class names
  const shouldShowLoading = props.isLoading ?? false;
  const containerClassName = useMemo(
    () => `${styles.scrollContainer} ${shouldShowBanner ? styles.disconnected : ''}`,
    [shouldShowBanner],
  );
  const canvasClassName = useMemo(
    () => `${styles.canvas} ${shouldBlockFunctionality ? styles.disabled : ''}`,
    [shouldBlockFunctionality],
  );
  const canvasContainerClassName = useMemo(
    () => `${styles.canvasContainer} ${hideBackground ? styles.hideBackground : ''}`,
    [hideBackground],
  );

  return (
    <div ref={containerRef} className={containerClassName}>
      <div className={canvasContainerClassName} style={canvasContainerStyle}>
        <div className={styles.canvasWrapper} style={canvasWrapperStyle}>
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            onMouseDown={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            className={canvasClassName}
            style={canvasStyle}
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
