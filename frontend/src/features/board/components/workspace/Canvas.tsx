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

/**
 * Default canvas configuration used when no custom config is provided.
 * Provides fallback values for background color, width, and height.
 */
const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  backgroundColor: CANVAS_CONFIG.DEFAULT_BACKGROUND_COLOR,
  width: CANVAS_CONFIG.DEFAULT_WIDTH,
  height: CANVAS_CONFIG.DEFAULT_HEIGHT,
};

/**
 * Props interface for Canvas component.
 * Defines the drawing state, interaction handlers, and canvas configuration.
 */
interface CanvasProps {
  /** Unique instance identifier for this canvas session */
  instanceId: string;
  /** Handler for drawing actions performed on the canvas */
  onDraw: (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => void;
  /** Array of drawing objects/actions to render on the canvas */
  objects: ActionPayload[];
  /** Currently selected drawing tool */
  tool: Tool;
  /** Current stroke color for drawing operations */
  strokeColor: string;
  /** Current stroke width for drawing operations */
  strokeWidth: number;
  /** Current font size for text tools */
  fontSize: number;
  /** Canvas configuration including dimensions and background color */
  canvasConfig?: CanvasConfig;
  /** Handler for color picking interactions on the canvas */
  onColorPick?: (color: string) => void;
  /** Whether the canvas is in a loading state */
  isLoading?: boolean;
}

/**
 * Interactive HTML5 canvas component for collaborative drawing and whiteboarding.
 * This component manages the drawing surface, tool interactions, text input overlays,
 * and connection status indicators for real-time collaborative drawing.
 * 
 * @param instanceId - Unique instance identifier for this canvas session
 * @param onDraw - Handler for drawing actions performed on the canvas
 * @param objects - Array of drawing objects/actions to render on the canvas
 * @param tool - Currently selected drawing tool
 * @param strokeColor - Current stroke color for drawing operations
 * @param strokeWidth - Current stroke width for drawing operations
 * @param fontSize - Current font size for text tools
 * @param canvasConfig - Canvas configuration including dimensions and background color
 * @param onColorPick - Handler for color picking interactions on the canvas
 * @param isLoading - Whether the canvas is in a loading state
 */
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

  textInputRequestRef.current = handleTextInputRequest;

  const canvasConfig = useMemo(
    () => props.canvasConfig ?? DEFAULT_CANVAS_CONFIG,
    [props.canvasConfig],
  );

  const canvasWidth = canvasConfig.width;
  const canvasHeight = canvasConfig.height;
  const padding = 0;
  const hideBackground = false;

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

  const shouldShowLoading = props.isLoading ?? false;
  const containerClassName = useMemo(
    () => `${styles.scrollContainer} ${shouldShowBanner ? styles.disconnected : ''}`,
    [shouldShowBanner],
  );
  const containerStyle = useMemo(
    () =>
      ({
        '--drawing-disabled-text': `"${t('common:connection.drawingDisabled')}"`,
      }) as React.CSSProperties,
    [t],
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
    <div ref={containerRef} className={containerClassName} style={containerStyle}>
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
