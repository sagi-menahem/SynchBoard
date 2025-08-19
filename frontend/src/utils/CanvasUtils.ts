import { CANVAS_CONFIG, TOOLS } from 'constants/BoardConstants';
import type { ActionPayload, CirclePayload, LinePayload, RectanglePayload } from 'types/BoardObjectTypes';

export const getMouseCoordinates = (
    event: MouseEvent, 
    canvas: HTMLCanvasElement
): { x: number; y: number } | null => {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };
};

export const isShapeSizeValid = (width: number, height: number): boolean => {
    return width > CANVAS_CONFIG.MIN_SHAPE_SIZE_THRESHOLD || height > CANVAS_CONFIG.MIN_SHAPE_SIZE_THRESHOLD;
};

export const isRadiusValid = (radius: number): boolean => {
    return radius > CANVAS_CONFIG.MIN_SHAPE_SIZE_THRESHOLD;
};

export const drawLinePayload = (
    payload: LinePayload, 
    targetCtx: CanvasRenderingContext2D, 
    targetCanvas: HTMLCanvasElement
): void => {
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
};

export const drawRectanglePayload = (
    payload: RectanglePayload, 
    targetCtx: CanvasRenderingContext2D, 
    targetCanvas: HTMLCanvasElement
): void => {
    const { x, y, width, height, color, strokeWidth } = payload;

    targetCtx.strokeStyle = color;
    targetCtx.lineWidth = strokeWidth;
    targetCtx.strokeRect(
        x * targetCanvas.width,
        y * targetCanvas.height,
        width * targetCanvas.width,
        height * targetCanvas.height
    );
};

export const drawCirclePayload = (
    payload: CirclePayload, 
    targetCtx: CanvasRenderingContext2D, 
    targetCanvas: HTMLCanvasElement
): void => {
    const { x, y, radius, color, strokeWidth } = payload;

    targetCtx.strokeStyle = color;
    targetCtx.lineWidth = strokeWidth;
    targetCtx.beginPath();
    targetCtx.arc(x * targetCanvas.width, y * targetCanvas.height, radius * targetCanvas.width, 0, 2 * Math.PI);
    targetCtx.stroke();
};

export const setupCanvasContext = (canvas: HTMLCanvasElement | null): CanvasRenderingContext2D | null => {
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.lineCap = CANVAS_CONFIG.LINE_STYLE;
        ctx.lineJoin = CANVAS_CONFIG.LINE_STYLE;
    }

    return ctx;
};

export const replayDrawAction = (
    payload: ActionPayload, 
    targetCtx: CanvasRenderingContext2D, 
    targetCanvas: HTMLCanvasElement
): void => {
    targetCtx.globalCompositeOperation = CANVAS_CONFIG.COMPOSITE_OPERATIONS.DRAW;

    // Apply visual feedback based on transaction status
    const originalGlobalAlpha = targetCtx.globalAlpha;
    if (payload.transactionStatus === 'sending') {
        targetCtx.globalAlpha = 0.5; // Reduced opacity for sending drawings
    } else if (payload.transactionStatus === 'processing') {
        targetCtx.globalAlpha = 0.7; // Slightly reduced opacity for processing
    } else if (payload.transactionStatus === 'failed') {
        targetCtx.globalAlpha = 0.3; // More faded for failed drawings
    }
    // 'confirmed' or undefined status uses normal opacity (1.0)

    if (payload.tool === TOOLS.BRUSH || payload.tool === TOOLS.ERASER) {
        drawLinePayload(payload as LinePayload, targetCtx, targetCanvas);
    } else if (payload.tool === TOOLS.RECTANGLE) {
        drawRectanglePayload(payload as RectanglePayload, targetCtx, targetCanvas);
    } else if (payload.tool === TOOLS.CIRCLE) {
        drawCirclePayload(payload as CirclePayload, targetCtx, targetCanvas);
    }

    // Restore original alpha and composite operation
    targetCtx.globalAlpha = originalGlobalAlpha;
    targetCtx.globalCompositeOperation = CANVAS_CONFIG.COMPOSITE_OPERATIONS.DRAW;
};