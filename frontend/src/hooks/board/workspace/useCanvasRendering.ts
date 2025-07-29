// File: frontend/src/hooks/board/workspace/useCanvasRendering.ts
import { CANVAS_CONFIG, TOOLS } from 'constants/board.constants';
import { useCallback, useEffect, useRef } from 'react';
import type { ActionPayload, CirclePayload, LinePayload, RectanglePayload } from 'types/boardObject.types';

interface UseCanvasRenderingProps {
    mainCanvasRef: React.RefObject<HTMLCanvasElement>;
    previewCanvasRef: React.RefObject<HTMLCanvasElement>;
    objects: ActionPayload[];
    dimensions: { width: number; height: number };
}

export const useCanvasRendering = ({
    mainCanvasRef,
    previewCanvasRef,
    objects,
    dimensions,
}: UseCanvasRenderingProps) => {
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const previewContextRef = useRef<CanvasRenderingContext2D | null>(null);

    const replayDrawAction = useCallback(
        (payload: ActionPayload, targetCtx: CanvasRenderingContext2D, targetCanvas: HTMLCanvasElement) => {
            targetCtx.globalCompositeOperation = CANVAS_CONFIG.COMPOSITE_OPERATIONS.DRAW;

            if (payload.tool === TOOLS.BRUSH || payload.tool === TOOLS.ERASER) {
                const { points, color, lineWidth } = payload as LinePayload;
                if (points.length < 2) return;
                targetCtx.strokeStyle = color;
                targetCtx.lineWidth = lineWidth;
                if (payload.tool === TOOLS.ERASER) {
                    targetCtx.globalCompositeOperation = CANVAS_CONFIG.COMPOSITE_OPERATIONS.ERASE;
                }
                targetCtx.beginPath();
                targetCtx.moveTo(points[0].x * targetCanvas.width, points[0].y * targetCanvas.height);
                for (let i = 1; i < points.length; i++) {
                    targetCtx.lineTo(points[i].x * targetCanvas.width, points[i].y * targetCanvas.height);
                }
                targetCtx.stroke();
            } else if (payload.tool === TOOLS.RECTANGLE) {
                const { x, y, width, height, color, strokeWidth } = payload as RectanglePayload;
                targetCtx.strokeStyle = color;
                targetCtx.lineWidth = strokeWidth;
                targetCtx.strokeRect(
                    x * targetCanvas.width,
                    y * targetCanvas.height,
                    width * targetCanvas.width,
                    height * targetCanvas.height
                );
            } else if (payload.tool === TOOLS.CIRCLE) {
                const { x, y, radius, color, strokeWidth } = payload as CirclePayload;
                targetCtx.strokeStyle = color;
                targetCtx.lineWidth = strokeWidth;
                targetCtx.beginPath();
                targetCtx.arc(
                    x * targetCanvas.width,
                    y * targetCanvas.height,
                    radius * Math.min(targetCanvas.width, targetCanvas.height),
                    0,
                    2 * Math.PI
                );
                targetCtx.stroke();
            }
        },
        []
    );

    useEffect(() => {
        const setupContext = (canvas: HTMLCanvasElement | null) => {
            if (!canvas) return null;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineCap = CANVAS_CONFIG.LINE_STYLE;
                ctx.lineJoin = CANVAS_CONFIG.LINE_STYLE;
            }
            return ctx;
        };
        contextRef.current = setupContext(mainCanvasRef.current);
        previewContextRef.current = setupContext(previewCanvasRef.current);
    }, [dimensions, mainCanvasRef, previewCanvasRef]);

    useEffect(() => {
        const canvas = mainCanvasRef.current;
        const ctx = contextRef.current;
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        objects.forEach((obj) => replayDrawAction(obj, ctx, canvas));
    }, [objects, dimensions, replayDrawAction, mainCanvasRef]);

    return {
        contextRef,
        previewContextRef,
        replayDrawAction,
    };
};
