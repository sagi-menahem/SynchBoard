import { useEffect } from 'react';

import type { ActionPayload } from 'types/boardObject.types';

import { useCanvasUtils } from './useCanvasUtils';

interface UseCanvasRenderingProps {
    mainCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    contextRef: React.RefObject<CanvasRenderingContext2D | null>;
    objects: ActionPayload[];
    dimensions: { width: number; height: number };
}

export const useCanvasRendering = ({ mainCanvasRef, contextRef, objects, dimensions }: UseCanvasRenderingProps) => {
    const { replayDrawAction } = useCanvasUtils();

    useEffect(() => {
        const canvas = mainCanvasRef.current;
        const ctx = contextRef.current;
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        objects.forEach((obj) => replayDrawAction(obj, ctx, canvas));
    }, [objects, dimensions, replayDrawAction, mainCanvasRef, contextRef]);

    return {
        replayDrawAction,
    };
};
