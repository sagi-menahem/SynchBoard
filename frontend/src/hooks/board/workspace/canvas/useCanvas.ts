import { useEffect } from 'react';

import { CANVAS_CONFIG } from 'constants/BoardConstants';
import type { ActionPayload, SendBoardActionRequest } from 'types/BoardObjectTypes';
import type { CanvasConfig } from 'types/BoardTypes';
import type { Tool } from 'types/CommonTypes';

import { useCanvasCore } from './useCanvasCore';
import { useCanvasInteractions } from './useCanvasInteractions';
import { useCanvasRendering } from './useCanvasRendering';

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
  const { dimensions, refs, drawingState, utils } = useCanvasCore();
  const { canvasRef, containerRef, contextRef } = refs;

  const finalCanvasConfig = canvasConfig || {
    backgroundColor: CANVAS_CONFIG.DEFAULT_BACKGROUND_COLOR,
    width: CANVAS_CONFIG.DEFAULT_WIDTH,
    height: CANVAS_CONFIG.DEFAULT_HEIGHT,
  };

  useEffect(() => {
    utils.setCanvasDimensions(finalCanvasConfig.width, finalCanvasConfig.height);
  }, [finalCanvasConfig.width, finalCanvasConfig.height, utils]);

  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0 && canvasRef.current && !contextRef.current) {
      contextRef.current = utils.setupCanvasContext(canvasRef.current);
    }
  }, [dimensions, canvasRef, contextRef, utils]);

  useCanvasRendering({
    canvasRef,
    contextRef,
    objects,
    dimensions,
    replayDrawAction: utils.replayDrawAction,
  });

  const { handleMouseDown } = useCanvasInteractions({
    canvasRef,
    contextRef,
    tool,
    strokeWidth,
    strokeColor,
    onDraw,
    senderId,
    drawingState,
    getMouseCoordinates: (event: MouseEvent, canvas: HTMLCanvasElement) => 
      utils.getMouseCoordinates(event, canvas),
    isShapeSizeValid: utils.isShapeSizeValid,
    isRadiusValid: utils.isRadiusValid,
    onTextInputRequest,
  });

  return {
    canvasRef,
    containerRef,
    dimensions,
    handleMouseDown,
  };
};
