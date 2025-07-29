// File: frontend/src/hooks/board/workspace/canvas/useCanvasUtils.ts
import { CANVAS_CONFIG, TOOLS } from 'constants/board.constants';
import { useCallback } from 'react';
import type { ActionPayload, CirclePayload, LinePayload, RectanglePayload } from 'types/boardObject.types';

/**
 * Utility functions for canvas operations
 */
export const useCanvasUtils = () => {
    const drawLinePayload = useCallback(
        (payload: LinePayload, targetCtx: CanvasRenderingContext2D, targetCanvas: HTMLCanvasElement) => {
            const { points, color, lineWidth } = payload;
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
        },
        []
    );

    const drawRectanglePayload = useCallback(
        (payload: RectanglePayload, targetCtx: CanvasRenderingContext2D, targetCanvas: HTMLCanvasElement) => {
            const { x, y, width, height, color, strokeWidth } = payload;

            targetCtx.strokeStyle = color;
            targetCtx.lineWidth = strokeWidth;
            targetCtx.strokeRect(
                x * targetCanvas.width,
                y * targetCanvas.height,
                width * targetCanvas.width,
                height * targetCanvas.height
            );
        },
        []
    );

    const drawCirclePayload = useCallback(
        (payload: CirclePayload, targetCtx: CanvasRenderingContext2D, targetCanvas: HTMLCanvasElement) => {
            const { x, y, radius, color, strokeWidth } = payload;

            targetCtx.strokeStyle = color;
            targetCtx.lineWidth = strokeWidth;
            targetCtx.beginPath();
            targetCtx.arc(x * targetCanvas.width, y * targetCanvas.height, radius * targetCanvas.width, 0, 2 * Math.PI);
            targetCtx.stroke();
        },
        []
    );

    const replayDrawAction = useCallback(
        (payload: ActionPayload, targetCtx: CanvasRenderingContext2D, targetCanvas: HTMLCanvasElement) => {
            targetCtx.globalCompositeOperation = CANVAS_CONFIG.COMPOSITE_OPERATIONS.DRAW;

            if (payload.tool === TOOLS.BRUSH || payload.tool === TOOLS.ERASER) {
                drawLinePayload(payload as LinePayload, targetCtx, targetCanvas);
            } else if (payload.tool === TOOLS.RECTANGLE) {
                drawRectanglePayload(payload as RectanglePayload, targetCtx, targetCanvas);
            } else if (payload.tool === TOOLS.CIRCLE) {
                drawCirclePayload(payload as CirclePayload, targetCtx, targetCanvas);
            }

            targetCtx.globalCompositeOperation = CANVAS_CONFIG.COMPOSITE_OPERATIONS.DRAW;
        },
        [drawLinePayload, drawRectanglePayload, drawCirclePayload]
    );

    const setupCanvasContext = useCallback((canvas: HTMLCanvasElement | null): CanvasRenderingContext2D | null => {
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.lineCap = CANVAS_CONFIG.LINE_STYLE;
            ctx.lineJoin = CANVAS_CONFIG.LINE_STYLE;
        }

        return ctx;
    }, []);

    const getMouseCoordinates = useCallback(
        (event: MouseEvent, canvas: HTMLCanvasElement): { x: number; y: number } | null => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            };
        },
        []
    );

    const isShapeSizeValid = useCallback((width: number, height: number): boolean => {
        return width > CANVAS_CONFIG.MIN_SHAPE_SIZE_THRESHOLD || height > CANVAS_CONFIG.MIN_SHAPE_SIZE_THRESHOLD;
    }, []);

    const isRadiusValid = useCallback((radius: number): boolean => {
        return radius > CANVAS_CONFIG.MIN_SHAPE_SIZE_THRESHOLD;
    }, []);

    return {
        replayDrawAction,
        drawLinePayload,
        drawRectanglePayload,
        drawCirclePayload,
        setupCanvasContext,
        getMouseCoordinates,
        isShapeSizeValid,
        isRadiusValid,
    };
};
