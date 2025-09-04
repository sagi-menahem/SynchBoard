import { CANVAS_CONFIG } from 'features/board/constants/BoardConstants';
import type { ActionPayload, SendBoardActionRequest } from 'features/board/types/BoardObjectTypes';
import type { CanvasConfig } from 'features/board/types/BoardTypes';
import { useCallback, useMemo } from 'react';
import type { Tool } from 'shared/types/CommonTypes';

import { useCanvasEvents, type CanvasEventData } from './useCanvasEvents';
import { useCanvasPreview } from './useCanvasPreview';
import { useCanvasState } from './useCanvasState';
import { useDrawingTools } from './useDrawingTools';

interface UseCanvasProps {
  instanceId: string;
  tool: Tool;
  strokeColor: string;
  strokeWidth: number;
  objects: ActionPayload[];
  onDraw: (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => void;
  canvasConfig?: CanvasConfig;
  onTextInputRequest?: (x: number, y: number, width: number, height: number) => void;
}

// Default canvas configuration - memoized to prevent recreation
const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  backgroundColor: CANVAS_CONFIG.DEFAULT_BACKGROUND_COLOR,
  width: CANVAS_CONFIG.DEFAULT_WIDTH,
  height: CANVAS_CONFIG.DEFAULT_HEIGHT,
};

export const useCanvas = ({
  instanceId: senderId,
  tool,
  strokeColor,
  strokeWidth,
  objects,
  onDraw,
  canvasConfig,
  onTextInputRequest,
}: UseCanvasProps) => {
  // Memoize final canvas config to prevent unnecessary re-renders
  const finalCanvasConfig = useMemo(() => canvasConfig ?? DEFAULT_CANVAS_CONFIG, [canvasConfig]);

  // Canvas state and utilities
  const {
    canvasRef,
    containerRef,
    contextRef,
    dimensions,
    isDrawing,
    setIsDrawing,
    startPoint,
    currentPath,
    resetDrawingState,
    getMouseCoordinates,
    isShapeSizeValid,
    isRadiusValid,
  } = useCanvasState({
    objects,
    canvasConfig: finalCanvasConfig,
  });

  // Memoize state objects to prevent unnecessary hook re-execution
  const canvasEventsState = useMemo(
    () => ({
      isDrawing,
      setIsDrawing,
      startPoint,
      resetDrawingState,
    }),
    [isDrawing, setIsDrawing, startPoint, resetDrawingState],
  );

  const drawingToolsState = useMemo(
    () => ({
      currentPath,
    }),
    [currentPath],
  );

  // Memoize hook configuration objects to prevent unnecessary re-renders
  const previewConfig = useMemo(
    () => ({
      canvasRef,
      contextRef,
      tool,
      strokeWidth,
      strokeColor,
      currentPath,
    }),
    [canvasRef, contextRef, tool, strokeWidth, strokeColor, currentPath],
  );

  const drawingToolsConfig = useMemo(
    () => ({
      canvasRef,
      tool,
      strokeWidth,
      strokeColor,
      onDraw,
      senderId,
      drawingState: drawingToolsState,
      isShapeSizeValid,
      isRadiusValid,
      onTextInputRequest,
    }),
    [
      canvasRef,
      tool,
      strokeWidth,
      strokeColor,
      onDraw,
      senderId,
      drawingToolsState,
      isShapeSizeValid,
      isRadiusValid,
      onTextInputRequest,
    ],
  );

  // Initialize the three focused hooks with memoized configs
  const { handlePreviewStart, handlePreviewMove, handlePreviewEnd } =
    useCanvasPreview(previewConfig);
  const { handleToolMouseDown, handleToolMouseMove, handleToolMouseUp } =
    useDrawingTools(drawingToolsConfig);

  // Compose the event handlers
  const handleMouseDown = useCallback(
    (eventData: CanvasEventData) => {
      handlePreviewStart(eventData);
      handleToolMouseDown(eventData);
    },
    [handlePreviewStart, handleToolMouseDown],
  );

  const handleMouseMove = useCallback(
    (eventData: CanvasEventData) => {
      handlePreviewMove(eventData);
      handleToolMouseMove(eventData);
    },
    [handlePreviewMove, handleToolMouseMove],
  );

  const handleMouseUp = useCallback(
    (eventData: CanvasEventData) => {
      handlePreviewEnd();
      handleToolMouseUp(eventData);
    },
    [handlePreviewEnd, handleToolMouseUp],
  );

  // Memoize canvas events configuration
  const canvasEventsConfig = useMemo(
    () => ({
      canvasRef,
      contextRef,
      drawingState: canvasEventsState,
      getMouseCoordinates,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
    }),
    [
      canvasRef,
      contextRef,
      canvasEventsState,
      getMouseCoordinates,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
    ],
  );

  // Canvas events hook handles the actual mouse events and calls our composed handlers
  const { handleMouseDown: canvasMouseDown } = useCanvasEvents(canvasEventsConfig);

  return {
    canvasRef,
    containerRef,
    dimensions,
    handleMouseDown: canvasMouseDown,
  };
};
