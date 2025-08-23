import { useEffect } from 'react';

import type { ActionPayload, SendBoardActionRequest } from 'types/BoardObjectTypes';
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
}

export const useCanvas = ({
  instanceId: senderId,
  tool,
  strokeColor,
  strokeWidth,
  objects,
  onDraw,
}: UseCanvasProps) => {
  const { dimensions, refs, drawingState, utils } = useCanvasCore();
  const { canvasRef, containerRef, contextRef } = refs;

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
    getMouseCoordinates: utils.getMouseCoordinates,
    isShapeSizeValid: utils.isShapeSizeValid,
    isRadiusValid: utils.isRadiusValid,
  });

  return {
    canvasRef,
    containerRef,
    dimensions,
    handleMouseDown,
  };
};
