import { useEffect } from 'react';

import type { ActionPayload } from 'types/BoardObjectTypes';

interface UseCanvasRenderingProps {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    contextRef: React.RefObject<CanvasRenderingContext2D | null>;
    objects: ActionPayload[];
    dimensions: { width: number; height: number };
    replayDrawAction: (payload: ActionPayload, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
}

export const useCanvasRendering = ({ 
  canvasRef, 
  contextRef, 
  objects, 
  dimensions, 
  replayDrawAction, 
}: UseCanvasRenderingProps) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    
    if (!canvas || !ctx || dimensions.width === 0 || dimensions.height === 0) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects.forEach((obj) => replayDrawAction(obj, ctx, canvas));
  }, [objects, dimensions, replayDrawAction, canvasRef, contextRef]);
};
