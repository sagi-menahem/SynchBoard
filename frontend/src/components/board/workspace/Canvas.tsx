import React, { useEffect, useState } from 'react';

import { floodFill } from 'utils/canvas/floodFill';

import { CANVAS_CONFIG, TOOLS } from 'constants/BoardConstants';
import { useCanvas } from 'hooks/board/workspace/canvas/useCanvas';
import { useConnectionStatus, usePreferences } from 'hooks/common';
import type { ActionPayload, FillPayload, SendBoardActionRequest, TextPayload } from 'types/BoardObjectTypes';
import type { CanvasConfig } from 'types/BoardTypes';
import type { Tool } from 'types/CommonTypes';

import styles from './Canvas.module.css';
import TextInputOverlay from './TextInputOverlay';

interface CanvasProps {
    instanceId: string;
    onDraw: (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => void;
    objects: ActionPayload[];
    tool: Tool;
    strokeColor: string;
    strokeWidth: number;
    canvasConfig?: CanvasConfig;
    onColorPick?: (color: string) => void;
}

const Canvas: React.FC<CanvasProps> = (props) => {
  const { canvasRef, containerRef, handleMouseDown } = useCanvas({ ...props });
  const { shouldShowBanner, shouldBlockFunctionality } = useConnectionStatus();
  const { preferences } = usePreferences();
  const [showLoading, setShowLoading] = useState(true);
  const [textInput, setTextInput] = useState<{ x: number; y: number } | null>(null);

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

  // Canvas at 100% zoom (1:1 scale)
  const canvasWidth = canvasConfig.width;
  const canvasHeight = canvasConfig.height;
  const padding = 40; // 20px padding on each side

  // Always show striped background for visual reference
  const hideBackground = false;

  // Container sizing for 100% zoom behavior
  const canvasContainerStyle = {
    minWidth: `${canvasWidth + padding}px`,
    minHeight: `${canvasHeight + padding}px`,
  };

  // Handle canvas click for text tool and color picker
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (props.tool === TOOLS.TEXT) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTextInput({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      e.preventDefault();
      return;
    } else if (props.tool === TOOLS.COLOR_PICKER && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const imageData = ctx.getImageData(x, y, 1, 1);
        const data = imageData.data;
        const hex = `#${((1 << 24) + (data[0] << 16) + (data[1] << 8) + data[2]).toString(16).slice(1)}`;
        props.onColorPick?.(hex);
      }
      e.preventDefault();
      return;
    } else if (props.tool === TOOLS.FILL && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(e.clientX - rect.left);
      const y = Math.floor(e.clientY - rect.top);
      
      // Perform flood fill
      floodFill(canvas, x, y, props.strokeColor);
      
      // Send fill action for real-time sync
      props.onDraw({
        type: 'OBJECT_ADD',
        payload: {
          tool: TOOLS.FILL,
          x: x / canvas.width,
          y: y / canvas.height,
          color: props.strokeColor,
        } as Omit<FillPayload, 'instanceId'>,
        sender: props.instanceId,
      });
      
      e.preventDefault();
      return;
    }
    handleMouseDown(e);
  };

  const handleTextSubmit = (text: string) => {
    if (textInput && canvasRef.current) {
      const canvas = canvasRef.current;
      props.onDraw({
        type: 'OBJECT_ADD',
        payload: {
          tool: TOOLS.TEXT,
          x: textInput.x / canvas.width,
          y: textInput.y / canvas.height,
          text,
          fontSize: props.strokeWidth,
          color: props.strokeColor,
        } as Omit<TextPayload, 'instanceId'>,
        sender: props.instanceId,
      });
    }
    setTextInput(null);
  };

  const handleTextCancel = () => {
    setTextInput(null);
  };

  const shouldShowLoading = showLoading;
  const containerClassName = `${styles.scrollContainer} ${shouldShowBanner ? styles.disconnected : ''}`;
  const canvasClassName = `${styles.canvas} ${shouldBlockFunctionality ? styles.disabled : ''}`;
  const canvasContainerClassName = `${styles.canvasContainer} ${hideBackground ? styles.hideBackground : ''}`;

  return (
    <div ref={containerRef} className={containerClassName}>
      <div 
        className={canvasContainerClassName}
        style={{ 
          backgroundColor: preferences.boardBackgroundSetting || undefined,
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
            className={canvasClassName}
            style={{ backgroundColor: canvasConfig.backgroundColor }}
          />
          
          {textInput && (
            <TextInputOverlay
              x={textInput.x}
              y={textInput.y}
              color={props.strokeColor}
              fontSize={props.strokeWidth}
              onSubmit={handleTextSubmit}
              onCancel={handleTextCancel}
            />
          )}
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
