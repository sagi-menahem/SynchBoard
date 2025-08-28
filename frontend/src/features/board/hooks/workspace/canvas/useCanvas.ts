import { CANVAS_CONFIG } from 'features/board/constants/BoardConstants';
import type { ActionPayload, SendBoardActionRequest } from 'features/board/types/BoardObjectTypes';
import type { CanvasConfig } from 'features/board/types/BoardTypes';
import type { Tool } from 'shared/types/CommonTypes';

import { useCanvasInteractions } from './useCanvasInteractions';
import { useCanvasState } from './useCanvasState';

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
  const finalCanvasConfig = canvasConfig || {
    backgroundColor: CANVAS_CONFIG.DEFAULT_BACKGROUND_COLOR,
    width: CANVAS_CONFIG.DEFAULT_WIDTH,
    height: CANVAS_CONFIG.DEFAULT_HEIGHT,
  };

  // Single consolidated hook call - no more orchestration
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

  // Simplified drawing state object
  const drawingState = {
    isDrawing,
    setIsDrawing,
    startPoint,
    currentPath,
    resetDrawingState,
  };

  const { handleMouseDown } = useCanvasInteractions({
    canvasRef,
    contextRef,
    tool,
    strokeWidth,
    strokeColor,
    onDraw,
    senderId,
    drawingState,
    getMouseCoordinates,
    isShapeSizeValid,
    isRadiusValid,
    onTextInputRequest,
  });

  return {
    canvasRef,
    containerRef,
    dimensions,
    handleMouseDown,
  };
};
