import { useCallback } from 'react';

import { CANVAS_CONFIG } from 'features/board/constants/BoardConstants';
import type { ActionPayload, SendBoardActionRequest } from 'features/board/types/BoardObjectTypes';
import type { CanvasConfig } from 'features/board/types/BoardTypes';
import type { Tool } from 'shared/types/CommonTypes';

import { useCanvasEvents } from './useCanvasEvents';
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
  const finalCanvasConfig = canvasConfig ?? {
    backgroundColor: CANVAS_CONFIG.DEFAULT_BACKGROUND_COLOR,
    width: CANVAS_CONFIG.DEFAULT_WIDTH,
    height: CANVAS_CONFIG.DEFAULT_HEIGHT,
  };

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

  // State objects for the three focused hooks
  const canvasEventsState = {
    isDrawing,
    setIsDrawing,
    startPoint,
    resetDrawingState,
  };

  const drawingToolsState = {
    currentPath,
  };

  // Initialize the three focused hooks
  const { handlePreviewStart, handlePreviewMove, handlePreviewEnd } = useCanvasPreview({
    canvasRef,
    contextRef,
    tool,
    strokeWidth,
    strokeColor,
    currentPath,
  });

  const { handleToolMouseDown, handleToolMouseMove, handleToolMouseUp } = useDrawingTools({
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
  });

  // Compose the event handlers
  const handleMouseDown = useCallback((eventData: any) => {
    handlePreviewStart(eventData);
    handleToolMouseDown(eventData);
  }, [handlePreviewStart, handleToolMouseDown]);

  const handleMouseMove = useCallback((eventData: any) => {
    handlePreviewMove(eventData);
    handleToolMouseMove(eventData);
  }, [handlePreviewMove, handleToolMouseMove]);

  const handleMouseUp = useCallback((eventData: any) => {
    handlePreviewEnd();
    handleToolMouseUp(eventData);
  }, [handlePreviewEnd, handleToolMouseUp]);

  // Canvas events hook handles the actual mouse events and calls our composed handlers
  const { handleMouseDown: canvasMouseDown } = useCanvasEvents({
    canvasRef,
    contextRef,
    drawingState: canvasEventsState,
    getMouseCoordinates,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
  });

  return {
    canvasRef,
    containerRef,
    dimensions,
    handleMouseDown: canvasMouseDown,
  };
};
