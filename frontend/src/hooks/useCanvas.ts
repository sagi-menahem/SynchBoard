// File: frontend/src/hooks/useBoardCanvas.ts

import React, { useRef, useEffect, useState, useLayoutEffect, useCallback } from 'react';
import type { BoardActionResponse, SendBoardActionRequest } from '../types/boardObject.types';
import { ActionType } from '../types/boardObject.types';
import { CANVAS_CONFIG, TOOLS, type TOOL_LIST } from '../constants/board.constants';

type Tool = typeof TOOL_LIST[number];
type Point = { x: number; y: number };
interface RectanglePayload { x: number; y: number; width: number; height: number; color: string; strokeWidth: number; tool: 'rectangle'; }
interface LinePayload { points: Point[]; color: string; lineWidth: number; tool: 'brush' | 'eraser'; }
interface CirclePayload { x: number; y: number; radius: number; color: string; strokeWidth: number; tool: 'circle'; }
type ActionPayload = LinePayload | RectanglePayload | CirclePayload;

interface UseBoardCanvasProps {
    boardId: number;
    instanceId: string;
    tool: Tool;
    strokeColor: string;
    strokeWidth: number;
    initialObjects: BoardActionResponse[];
    receivedAction: BoardActionResponse | null;
    onDraw: (action: SendBoardActionRequest) => void;
}

export const useBoardCanvas = ({ boardId, instanceId, tool, strokeColor, strokeWidth, initialObjects, receivedAction, onDraw }: UseBoardCanvasProps) => {
    const mainCanvasRef = useRef<HTMLCanvasElement>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const previewContextRef = useRef<CanvasRenderingContext2D | null>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const startPoint = useRef<Point | null>(null);
    const currentPath = useRef<Point[]>([]);
    const [renderedObjects, setRenderedObjects] = useState<ActionPayload[]>([]);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const resizeObserver = new ResizeObserver(entries => {
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

    useEffect(() => {
        const initialPayloads = initialObjects.map(action => action.payload as ActionPayload);
        setRenderedObjects(initialPayloads);
    }, [initialObjects]);

    useEffect(() => {
        if (receivedAction?.type === ActionType.OBJECT_ADD) {
            const newPayload = receivedAction.payload as ActionPayload;
            setRenderedObjects(prev => [...prev, newPayload]);
        }
    }, [receivedAction]);
    
    const replayDrawAction = useCallback((payload: ActionPayload, targetCtx: CanvasRenderingContext2D, targetCanvas: HTMLCanvasElement) => {
        targetCtx.globalCompositeOperation = CANVAS_CONFIG.COMPOSITE_OPERATIONS.DRAW;
        if (payload.tool === TOOLS.BRUSH || payload.tool === TOOLS.ERASER) {
            const { points, color, lineWidth, tool: lineTool } = payload;
            if (points.length < 2) return;
            targetCtx.strokeStyle = color;
            targetCtx.lineWidth = lineWidth;
            if (lineTool === TOOLS.ERASER) {
                targetCtx.globalCompositeOperation = CANVAS_CONFIG.COMPOSITE_OPERATIONS.ERASE;
            }
            targetCtx.beginPath();
            targetCtx.moveTo(points[0].x * targetCanvas.width, points[0].y * targetCanvas.height);
            for (let i = 1; i < points.length; i++) {
                targetCtx.lineTo(points[i].x * targetCanvas.width, points[i].y * targetCanvas.height);
            }
            targetCtx.stroke();
        } else if (payload.tool === TOOLS.RECTANGLE) {
            const { x, y, width, height, color, strokeWidth: rectStrokeWidth } = payload;
            targetCtx.strokeStyle = color;
            targetCtx.lineWidth = rectStrokeWidth;
            targetCtx.strokeRect(x * targetCanvas.width, y * targetCanvas.height, width * targetCanvas.width, height * targetCanvas.height);
        } else if (payload.tool === TOOLS.CIRCLE) {
            const { x, y, radius, color, strokeWidth: circleStrokeWidth } = payload;
            targetCtx.strokeStyle = color;
            targetCtx.lineWidth = circleStrokeWidth;
            targetCtx.beginPath();
            targetCtx.arc(x * targetCanvas.width, y * targetCanvas.height, radius * targetCanvas.width, 0, 2 * Math.PI);
            targetCtx.stroke();
        }
        targetCtx.globalCompositeOperation = CANVAS_CONFIG.COMPOSITE_OPERATIONS.DRAW;
    }, []);

    useEffect(() => {
        const canvas = mainCanvasRef.current;
        const ctx = contextRef.current;
        if (!canvas || !ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderedObjects.forEach(obj => replayDrawAction(obj, ctx, canvas));
        previewContextRef.current?.clearRect(0, 0, canvas.width, canvas.height);
    }, [renderedObjects, dimensions, replayDrawAction]);

    const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = previewCanvasRef.current;
        if (!canvas) return;
        const { offsetX, offsetY } = event.nativeEvent;
        setIsDrawing(true);
        if (tool === TOOLS.BRUSH || tool === TOOLS.ERASER) {
            currentPath.current = [{ x: offsetX / canvas.width, y: offsetY / canvas.height }];
        } else if (tool === TOOLS.RECTANGLE || tool === TOOLS.CIRCLE) {
            startPoint.current = { x: offsetX, y: offsetY };
        }
    }, [tool]);

    const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const previewCtx = previewContextRef.current;
        const canvas = previewCanvasRef.current;
        if (!previewCtx || !canvas) return;
        
        const { offsetX, offsetY } = event.nativeEvent;
        previewCtx.clearRect(0, 0, canvas.width, canvas.height);
        previewCtx.lineWidth = strokeWidth;
        previewCtx.globalCompositeOperation = CANVAS_CONFIG.COMPOSITE_OPERATIONS.DRAW;
        previewCtx.strokeStyle = tool === TOOLS.ERASER ? CANVAS_CONFIG.PREVIEW_ERASER_COLOR : strokeColor;

        if (tool === TOOLS.BRUSH || tool === TOOLS.ERASER) {
            currentPath.current.push({ x: offsetX / canvas.width, y: offsetY / canvas.height });
            previewCtx.beginPath();
            if (currentPath.current.length > 0) {
                previewCtx.moveTo(currentPath.current[0].x * canvas.width, currentPath.current[0].y * canvas.height);
                for (let i = 1; i < currentPath.current.length; i++) {
                    previewCtx.lineTo(currentPath.current[i].x * canvas.width, currentPath.current[i].y * canvas.height);
                }
                previewCtx.stroke();
            }
        } else if (tool === TOOLS.RECTANGLE && startPoint.current) {
            previewCtx.strokeRect(startPoint.current.x, startPoint.current.y, offsetX - startPoint.current.x, offsetY - startPoint.current.y);
        } else if (tool === TOOLS.CIRCLE && startPoint.current) {
            const radius = Math.sqrt(Math.pow(offsetX - startPoint.current.x, 2) + Math.pow(offsetY - startPoint.current.y, 2));
            previewCtx.beginPath();
            previewCtx.arc(startPoint.current.x, startPoint.current.y, radius, 0, 2 * Math.PI);
            previewCtx.stroke();
        }
    }, [isDrawing, tool, strokeColor, strokeWidth]);

    const handleMouseUp = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const canvas = previewCanvasRef.current;
        if (!canvas) return;
        
        let payload: ActionPayload | null = null;
        if ((tool === TOOLS.BRUSH || tool === TOOLS.ERASER) && currentPath.current.length > 1) {
            payload = { tool, points: currentPath.current, color: strokeColor, lineWidth: strokeWidth };
        } else if (tool === TOOLS.RECTANGLE && startPoint.current) {
            const { offsetX, offsetY } = event.nativeEvent;
            const rectX = Math.min(startPoint.current.x, offsetX) / canvas.width;
            const rectY = Math.min(startPoint.current.y, offsetY) / canvas.height;
            const rectWidth = Math.abs(offsetX - startPoint.current.x) / canvas.width;
            const rectHeight = Math.abs(offsetY - startPoint.current.y) / canvas.height;
            if (rectWidth > 0 || rectHeight > 0) {
                payload = { tool: TOOLS.RECTANGLE, x: rectX, y: rectY, width: rectWidth, height: rectHeight, color: strokeColor, strokeWidth };
            }
        } else if (tool === TOOLS.CIRCLE && startPoint.current) {
            const { offsetX, offsetY } = event.nativeEvent;
            const radius = Math.sqrt(Math.pow(offsetX - startPoint.current.x, 2) + Math.pow(offsetY - startPoint.current.y, 2)) / canvas.width;
            if (radius > 0) {
                payload = { tool: TOOLS.CIRCLE, x: startPoint.current.x / canvas.width, y: startPoint.current.y / canvas.height, radius, color: strokeColor, strokeWidth };
            }
        }

        if (payload) {
            onDraw({ boardId, instanceId, type: ActionType.OBJECT_ADD, payload });
        }
        
        currentPath.current = [];
        startPoint.current = null;
    }, [isDrawing, tool, strokeColor, strokeWidth, boardId, instanceId, onDraw]);

    return {
        mainCanvasRef,
        previewCanvasRef,
        containerRef,
        dimensions,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
    };
};