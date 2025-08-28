import React, { useCallback, useState } from 'react';

import { CANVAS_CONFIG, TOOLS } from 'features/board/constants/BoardConstants';
import { useCanvas } from 'features/board/hooks/workspace/canvas/useCanvas';
import type { ActionPayload, SendBoardActionRequest, TextBoxPayload } from 'features/board/types/BoardObjectTypes';
import type { CanvasConfig } from 'features/board/types/BoardTypes';
import { getRecolorCursor } from 'features/board/utils/canvas/cursorUtils';
import { processRecolorClick } from 'features/board/utils/canvas/recolorLogic';
import { usePreferences } from 'features/settings/UserPreferencesProvider';
import { useConnectionStatus } from 'features/websocket/hooks/useConnectionStatus';
import { useTranslation } from 'react-i18next';
import type { Tool } from 'shared/types/CommonTypes';


import styles from './Canvas.module.css';
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
  const [textInput, setTextInput] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [recolorCursor, setRecolorCursor] = useState<string>('crosshair');
  
  const handleTextInputRequest = useCallback(
    (x: number, y: number, width: number, height: number) => {
      setTextInput({ x, y, width, height });
    },
    [],
  );
  
  const { canvasRef, containerRef, handleMouseDown } = useCanvas({
    ...props,
    onTextInputRequest: handleTextInputRequest,
  });
  const { shouldShowBanner, shouldBlockFunctionality } = useConnectionStatus();
  const { preferences } = usePreferences();

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

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (props.tool === TOOLS.COLOR_PICKER && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const imageData = ctx.getImageData(x, y, 1, 1);
        const data = imageData.data;
        
        if (data[3] === 0) {
          const backgroundColor = canvasConfig.backgroundColor ?? '#FFFFFF';
          // Ensure color is in 6-character hex format
          const normalizedColor = backgroundColor.length === 4 ? 
            `#${  backgroundColor.slice(1).split('').map((c) => c + c).join('')}` :
            backgroundColor;
          props.onColorPick?.(normalizedColor);
        } else {
          const hex = `#${((1 << 24) + (data[0] << 16) + (data[1] << 8) + data[2]).toString(16).slice(1)}`;
          props.onColorPick?.(hex);
        }
      }
      e.preventDefault();
      return;
    } else if (props.tool === TOOLS.RECOLOR && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      const recolorAction = processRecolorClick(
        { x: clickX, y: clickY },
        props.objects,
        canvas.width,
        canvas.height,
        props.strokeColor,
        props.instanceId,
      );
      
      if (recolorAction.shouldPerformAction && recolorAction.action) {
        props.onDraw(recolorAction.action);
      }
      
      e.preventDefault();
      return;
    }
    handleMouseDown(e);
  };

  const handleTextSubmit = (text: string) => {
    if (textInput !== null && canvasRef.current !== null) {
      const canvas = canvasRef.current;
      props.onDraw({
        type: 'OBJECT_ADD',
        payload: {
          tool: TOOLS.TEXT,
          x: textInput.x / canvas.width,
          y: textInput.y / canvas.height,
          width: textInput.width / canvas.width,
          height: textInput.height / canvas.height,
          text,
          fontSize: props.fontSize,
          color: props.strokeColor,
        } as Omit<TextBoxPayload, 'instanceId'>,
        sender: props.instanceId,
      });
    }
    setTextInput(null);
  };

  const handleTextCancel = () => {
    setTextInput(null);
  };

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (props.tool !== TOOLS.RECOLOR || canvasRef.current === null) {
      return;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const cursor = getRecolorCursor(
      { x: mouseX, y: mouseY },
      props.objects,
      canvas.width,
      canvas.height,
    );

    setRecolorCursor(cursor);
  }, [props.tool, props.objects, canvasRef]);

  const shouldShowLoading = props.isLoading ?? false;
  const containerClassName = `${styles.scrollContainer} ${shouldShowBanner ? styles.disconnected : ''}`;
  const canvasClassName = `${styles.canvas} ${shouldBlockFunctionality ? styles.disabled : ''}`;
  const canvasContainerClassName = `${styles.canvasContainer} ${hideBackground ? styles.hideBackground : ''}`;

  return (
    <div ref={containerRef} className={containerClassName}>
      <div 
        className={canvasContainerClassName}
        style={{ 
          backgroundColor: preferences.boardBackgroundSetting ?? undefined,
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
