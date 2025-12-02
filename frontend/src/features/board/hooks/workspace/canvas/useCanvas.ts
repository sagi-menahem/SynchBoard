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
  zoomScale: number; // Zoom scale factor for coordinate adjustment
  /** Callback when zoom changes via pinch gesture */
  onZoomChange?: (newScale: number, centerPoint: { x: number; y: number }) => void;
}

const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  backgroundColor: CANVAS_CONFIG.DEFAULT_BACKGROUND_COLOR,
  width: CANVAS_CONFIG.DEFAULT_WIDTH,
  height: CANVAS_CONFIG.DEFAULT_HEIGHT,
};

/**
 * Custom hook that orchestrates comprehensive canvas functionality for collaborative drawing operations.
 * This hook serves as the main coordinator for canvas interactions, combining state management, event handling,
 * drawing tools, and preview functionality into a unified interface. It manages the complex coordination between
 * multiple specialized canvas hooks including state management, event processing, drawing tools, and live previews.
 * The hook handles canvas configuration, coordinate calculations, drawing validation, and provides the primary
 * event handler for canvas interactions. It abstracts the complexity of canvas operations while maintaining
 * separation of concerns through composition of specialized hooks.
 *
 * @param instanceId - Unique sender identifier for drawing actions and collaboration tracking
 * @param tool - Currently active drawing tool for canvas operations
 * @param strokeColor - Color setting for drawing operations and previews
 * @param strokeWidth - Width setting for stroke-based drawing operations
 * @param objects - Array of existing canvas objects to render and manage
 * @param onDraw - Callback function for submitting drawing actions to the collaboration system
 * @param canvasConfig - Optional canvas configuration including dimensions and background color
 * @param onTextInputRequest - Optional callback for initiating text input overlay operations
 * @returns Object containing canvas references, dimensions, and the main mouse event handler for canvas interactions
 */
export const useCanvas = ({
  instanceId: senderId,
  tool,
  strokeColor,
  strokeWidth,
  objects,
  onDraw,
  canvasConfig,
  onTextInputRequest,
  zoomScale,
  onZoomChange,
}: UseCanvasProps) => {
  const finalCanvasConfig = useMemo(() => canvasConfig ?? DEFAULT_CANVAS_CONFIG, [canvasConfig]);

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
    getPointerCoordinates,
    isShapeSizeValid,
    isRadiusValid,
  } = useCanvasState({
    objects,
    canvasConfig: finalCanvasConfig,
    zoomScale,
  });

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

  const { handlePreviewStart, handlePreviewMove, handlePreviewEnd } =
    useCanvasPreview(previewConfig);
  const { handleToolPointerDown, handleToolPointerMove, handleToolPointerUp } =
    useDrawingTools(drawingToolsConfig);

  const handlePointerDown = useCallback(
    (eventData: CanvasEventData) => {
      handlePreviewStart(eventData);
      handleToolPointerDown(eventData);
    },
    [handlePreviewStart, handleToolPointerDown],
  );

  const handlePointerMove = useCallback(
    (eventData: CanvasEventData) => {
      handlePreviewMove(eventData);
      handleToolPointerMove(eventData);
    },
    [handlePreviewMove, handleToolPointerMove],
  );

  const handlePointerUp = useCallback(
    (eventData: CanvasEventData) => {
      handlePreviewEnd();
      handleToolPointerUp(eventData);
    },
    [handlePreviewEnd, handleToolPointerUp],
  );

  const canvasEventsConfig = useMemo(
    () => ({
      canvasRef,
      containerRef,
      contextRef,
      drawingState: canvasEventsState,
      getPointerCoordinates,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      zoomScale,
      onZoomChange,
    }),
    [
      canvasRef,
      containerRef,
      contextRef,
      canvasEventsState,
      getPointerCoordinates,
      handlePointerDown,
      handlePointerMove,
      handlePointerUp,
      zoomScale,
      onZoomChange,
    ],
  );

  const { handlePointerDown: canvasPointerDown, isPanning } = useCanvasEvents(canvasEventsConfig);

  return {
    canvasRef,
    containerRef,
    dimensions,
    handlePointerDown: canvasPointerDown,
    isPanning,
  };
};
