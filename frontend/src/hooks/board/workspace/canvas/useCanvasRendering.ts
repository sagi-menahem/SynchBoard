import { useEffect } from 'react';

import type { ActionPayload } from 'types/BoardObjectTypes';

interface UseCanvasRenderingProps {
    mainCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    contextRef: React.RefObject<CanvasRenderingContext2D | null>;
    objects: ActionPayload[];
    dimensions: { width: number; height: number };
    replayDrawAction: (payload: ActionPayload, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
}

export const useCanvasRendering = ({ 
  mainCanvasRef, 
  contextRef, 
  objects, 
  dimensions, 
  replayDrawAction, 
}: UseCanvasRenderingProps) => {
  useEffect(() => {
    const canvas = mainCanvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects.forEach((obj) => replayDrawAction(obj, ctx, canvas));
  }, [objects, dimensions, replayDrawAction, mainCanvasRef, contextRef]);
};
