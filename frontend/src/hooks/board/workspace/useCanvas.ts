// File: frontend/src/hooks/useCanvas.ts
import { CANVAS_CONFIG, TOOLS, type TOOL_LIST } from 'constants/board.constants';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
    ActionType,
    type ActionPayload,
    type CirclePayload,
    type LinePayload,
    type RectanglePayload,
    type SendBoardActionRequest,
} from 'types/boardObject.types';

type Tool = (typeof TOOL_LIST)[number];
type Point = { x: number; y: number };

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
    const mainCanvasRef = useRef<HTMLCanvasElement>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const previewContextRef = useRef<CanvasRenderingContext2D | null>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const startPoint = useRef<Point | null>(null);
    const currentPath = useRef<Point[]>([]);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const resizeObserver = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
        });
        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, []);

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
    }, [dimensions]);

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
                    radius * targetCanvas.width,
                    0,
                    2 * Math.PI
                );
                targetCtx.stroke();
            }
            targetCtx.globalCompositeOperation = CANVAS_CONFIG.COMPOSITE_OPERATIONS.DRAW;
        },
        []
    );

    useEffect(() => {
        const canvas = mainCanvasRef.current;
        const ctx = contextRef.current;
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        objects.forEach((obj) => replayDrawAction(obj, ctx, canvas));
    }, [objects, dimensions, replayDrawAction]);

    useEffect(() => {
        const canvas = previewCanvasRef.current;
        if (!canvas) return;

        const getCoords = (event: MouseEvent): Point | null => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            };
        };

        const handleMouseMove = (event: MouseEvent) => {
            if (!isDrawing) return;
            const previewCtx = previewContextRef.current;
            const coords = getCoords(event);
            if (!previewCtx || !coords) return;

            previewCtx.clearRect(0, 0, canvas.width, canvas.height);
            previewCtx.lineWidth = strokeWidth;
            previewCtx.globalCompositeOperation = CANVAS_CONFIG.COMPOSITE_OPERATIONS.DRAW;
            previewCtx.strokeStyle = tool === TOOLS.ERASER ? CANVAS_CONFIG.PREVIEW_ERASER_COLOR : strokeColor;

            if (tool === TOOLS.BRUSH || tool === TOOLS.ERASER) {
                currentPath.current.push({ x: coords.x / canvas.width, y: coords.y / canvas.height });
                previewCtx.beginPath();
                if (currentPath.current.length > 1) {
                    previewCtx.moveTo(
                        currentPath.current[0].x * canvas.width,
                        currentPath.current[0].y * canvas.height
                    );
                    for (let i = 1; i < currentPath.current.length; i++) {
                        previewCtx.lineTo(
                            currentPath.current[i].x * canvas.width,
                            currentPath.current[i].y * canvas.height
                        );
                    }
                    previewCtx.stroke();
                }
            } else if (tool === TOOLS.RECTANGLE && startPoint.current) {
                previewCtx.strokeRect(
                    startPoint.current.x,
                    startPoint.current.y,
                    coords.x - startPoint.current.x,
                    coords.y - startPoint.current.y
                );
            } else if (tool === TOOLS.CIRCLE && startPoint.current) {
                const radius = Math.sqrt(
                    Math.pow(coords.x - startPoint.current.x, 2) + Math.pow(coords.y - startPoint.current.y, 2)
                );
                previewCtx.beginPath();
                previewCtx.arc(startPoint.current.x, startPoint.current.y, radius, 0, 2 * Math.PI);
                previewCtx.stroke();
            }
        };

        const handleMouseUp = (event: MouseEvent) => {
            if (!isDrawing) return;
            setIsDrawing(false);
            const previewCtx = previewContextRef.current;
            const coords = getCoords(event);
            if (!canvas || !previewCtx || !coords) return;

            previewCtx.clearRect(0, 0, canvas.width, canvas.height);

            if ((tool === TOOLS.BRUSH || tool === TOOLS.ERASER) && currentPath.current.length > 1) {
                const payload: Omit<LinePayload, 'instanceId'> = {
                    tool,
                    points: [...currentPath.current],
                    color: strokeColor,
                    lineWidth: strokeWidth,
                };
                onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
            } else if (tool === TOOLS.RECTANGLE && startPoint.current) {
                const rectX = Math.min(startPoint.current.x, coords.x) / canvas.width;
                const rectY = Math.min(startPoint.current.y, coords.y) / canvas.height;
                const rectWidth = Math.abs(coords.x - startPoint.current.x) / canvas.width;
                const rectHeight = Math.abs(coords.y - startPoint.current.y) / canvas.height;
                if (
                    rectWidth > CANVAS_CONFIG.MIN_SHAPE_SIZE_THRESHOLD ||
                    rectHeight > CANVAS_CONFIG.MIN_SHAPE_SIZE_THRESHOLD
                ) {
                    const payload: Omit<RectanglePayload, 'instanceId'> = {
                        tool,
                        x: rectX,
                        y: rectY,
                        width: rectWidth,
                        height: rectHeight,
                        color: strokeColor,
                        strokeWidth,
                    };
                    onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
                }
            } else if (tool === TOOLS.CIRCLE && startPoint.current) {
                const radius =
                    Math.sqrt(
                        Math.pow(coords.x - startPoint.current.x, 2) + Math.pow(coords.y - startPoint.current.y, 2)
                    ) / canvas.width;
                if (radius > CANVAS_CONFIG.MIN_SHAPE_SIZE_THRESHOLD) {
                    const payload: Omit<CirclePayload, 'instanceId'> = {
                        tool,
                        x: startPoint.current.x / canvas.width,
                        y: startPoint.current.y / canvas.height,
                        radius,
                        color: strokeColor,
                        strokeWidth,
                    };
                    onDraw({ type: ActionType.OBJECT_ADD, payload, sender: senderId });
                }
            }
            currentPath.current = [];
            startPoint.current = null;
        };

        if (isDrawing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDrawing, onDraw, senderId, strokeColor, strokeWidth, tool, replayDrawAction]);

    const handleMouseDown = useCallback(
        (event: React.MouseEvent<HTMLCanvasElement>) => {
            const canvas = previewCanvasRef.current;
            if (!canvas) return;

            setIsDrawing(true);
            const { offsetX, offsetY } = event.nativeEvent;

            if (tool === TOOLS.BRUSH || tool === TOOLS.ERASER) {
                currentPath.current = [{ x: offsetX / canvas.width, y: offsetY / canvas.height }];
            } else if (tool === TOOLS.RECTANGLE || tool === TOOLS.CIRCLE) {
                startPoint.current = { x: offsetX, y: offsetY };
            }
        },
        [tool]
    );

    return {
        mainCanvasRef,
        previewCanvasRef,
        containerRef,
        dimensions,
        handleMouseDown,
    };
};
