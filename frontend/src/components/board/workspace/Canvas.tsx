import React, { useEffect, useState, useRef, useCallback } from 'react';

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
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

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

  // Track container dimensions for zoom-based sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      setContainerDimensions({
        width: rect.width,
        height: rect.height,
      });
    };

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);
    updateDimensions(); // Initial measurement

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);


  // Calculate scaled canvas dimensions
  const scaledWidth = canvasConfig.width * zoomScale;
  const scaledHeight = canvasConfig.height * zoomScale;
  
  // Dynamic padding - minimal for small canvases
  const padding = 20;

  // Always show striped background for visual reference
  const hideBackground = false;

  // Calculate required canvas space
  const requiredWidth = scaledWidth + padding;
  const requiredHeight = scaledHeight + padding;
  
  // Determine if we need scrolling or if canvas fits within available space
  const needsHorizontalScroll = containerDimensions.width > 0 && requiredWidth > containerDimensions.width;
  const needsVerticalScroll = containerDimensions.height > 0 && requiredHeight > containerDimensions.height;
  
  // Smart container sizing based on zoom and available space
  const canvasContainerStyle = needsHorizontalScroll || needsVerticalScroll ? {
    // Canvas is larger than container - enable scrolling
    minWidth: `${requiredWidth}px`,
    minHeight: `${requiredHeight}px`,
    width: `${requiredWidth}px`,
    height: `${requiredHeight}px`,
  } : {
    // Canvas fits within container - fill available space to center properly
    width: '100%',
    height: '100%',
    minWidth: `${requiredWidth}px`,
    minHeight: `${requiredHeight}px`,
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
          ...canvasContainerStyle
        }}
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
