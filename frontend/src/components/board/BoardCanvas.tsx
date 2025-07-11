// File: frontend/src/components/board/BoardCanvas.tsx

import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { ActionType, type BoardActionResponse, type SendBoardActionRequest } from '../../types/websocket.types';

interface BoardCanvasProps {
  boardId: number;
  instanceId: string;
  onDraw: (action: SendBoardActionRequest) => void;
  receivedAction: BoardActionResponse | null;
  initialObjects: BoardActionResponse[];
  tool: 'brush' | 'eraser' | 'rectangle' | 'circle';
  strokeColor: string;
  strokeWidth: number;
}
type Point = { x: number; y: number };
interface RectanglePayload {
    x: number; y: number; width: number; height: number;
    color: string; strokeWidth: number; tool: 'rectangle';
}
interface LinePayload {
    points: Point[]; color: string; lineWidth: number; tool: 'brush' | 'eraser';
}
interface CirclePayload {
    x: number; y: number; radius: number;
    color: string; strokeWidth: number; tool: 'circle';
}
type ActionPayload = LinePayload | RectanglePayload | CirclePayload;

// --- Component ---
const BoardCanvas: React.FC<BoardCanvasProps> = ({ boardId, instanceId, onDraw, receivedAction, initialObjects, tool, strokeColor, strokeWidth }) => {
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

    // --- Effects ---
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
        const mainCanvas = mainCanvasRef.current;
        const previewCanvas = previewCanvasRef.current;
        if (!mainCanvas || !previewCanvas) return;
        const mainCtx = mainCanvas.getContext('2d');
        const previewCtx = previewCanvas.getContext('2d');
        if (mainCtx) { mainCtx.lineCap = 'round'; mainCtx.lineJoin = 'round'; contextRef.current = mainCtx; }
        if (previewCtx) { previewCtx.lineCap = 'round'; previewCtx.lineJoin = 'round'; previewContextRef.current = previewCtx; }
    }, [dimensions]);

    useEffect(() => {
        const initialPayloads = initialObjects.map(action => action.payload as ActionPayload);
        setRenderedObjects(initialPayloads);
    }, [initialObjects]);
    
    useEffect(() => {
        if (receivedAction?.type === ActionType.OBJECT_ADD) {
            const newPayload = receivedAction.payload as ActionPayload;
            setRenderedObjects(prevObjects => [...prevObjects, newPayload]);
        }
    }, [receivedAction]);

    useEffect(() => {
        const canvas = mainCanvasRef.current;
        const ctx = contextRef.current;
        if (!canvas || !ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderedObjects.forEach(obj => replayDrawAction(obj, ctx, canvas));
        previewContextRef.current?.clearRect(0, 0, canvas.width, canvas.height);
        
    }, [renderedObjects, dimensions]);

    const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        const { offsetX, offsetY } = nativeEvent;
        setIsDrawing(true);
        if (tool === 'brush' || tool === 'eraser') {
            currentPath.current = [{ x: offsetX / canvas.width, y: offsetY / canvas.height }];
        } else if (tool === 'rectangle' || tool === 'circle') {
            startPoint.current = { x: offsetX, y: offsetY };
        }
    };

    const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const previewCtx = previewContextRef.current;
        const canvas = mainCanvasRef.current;
        if (!previewCtx || !canvas) return;
        
        const { offsetX, offsetY } = nativeEvent;
        
        previewCtx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (tool === 'eraser') {
            previewCtx.strokeStyle = '#222';
        } else {
            previewCtx.strokeStyle = strokeColor;
        }
        previewCtx.lineWidth = strokeWidth;
        previewCtx.globalCompositeOperation = 'source-over';

        if (tool === 'brush' || tool === 'eraser') {
            previewCtx.beginPath();
            if(currentPath.current.length > 0) {
                previewCtx.moveTo(currentPath.current[0].x * canvas.width, currentPath.current[0].y * canvas.height);
                for(let i = 1; i < currentPath.current.length; i++) {
                    previewCtx.lineTo(currentPath.current[i].x * canvas.width, currentPath.current[i].y * canvas.height);
                }
                previewCtx.lineTo(offsetX, offsetY);
                previewCtx.stroke();
            }
        } else if (tool === 'rectangle' && startPoint.current) {
            const width = offsetX - startPoint.current.x;
            const height = offsetY - startPoint.current.y;
            previewCtx.strokeRect(startPoint.current.x, startPoint.current.y, width, height);
        } else if (tool === 'circle' && startPoint.current) {
            const deltaX = offsetX - startPoint.current.x;
            const deltaY = offsetY - startPoint.current.y;
            const radius = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            previewCtx.beginPath();
            previewCtx.arc(startPoint.current.x, startPoint.current.y, radius, 0, 2 * Math.PI);
            previewCtx.stroke();
        }
        
        currentPath.current.push({ x: offsetX / canvas.width, y: offsetY / canvas.height });
    };

    const finishDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        
        let payload: ActionPayload | null = null;
        if ((tool === 'brush' || tool === 'eraser') && currentPath.current.length > 1) {
            payload = { tool, points: currentPath.current, color: strokeColor, lineWidth: strokeWidth };
        } else if (tool === 'rectangle' && startPoint.current) {
            const { offsetX, offsetY } = nativeEvent;
            const rectX = Math.min(startPoint.current.x, offsetX);
            const rectY = Math.min(startPoint.current.y, offsetY);
            const rectWidth = Math.abs(offsetX - startPoint.current.x);
            const rectHeight = Math.abs(offsetY - startPoint.current.y);
            if (rectWidth > 0 || rectHeight > 0) {
                payload = { tool: 'rectangle', x: rectX / canvas.width, y: rectY / canvas.height, width: rectWidth / canvas.width, height: rectHeight / canvas.height, color: strokeColor, strokeWidth };
            }
        } else if (tool === 'circle' && startPoint.current) {
            const { offsetX, offsetY } = nativeEvent;
            const deltaX = offsetX - startPoint.current.x;
            const deltaY = offsetY - startPoint.current.y;
            const radius = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if (radius > 0) {
                payload = { tool: 'circle', x: startPoint.current.x / canvas.width, y: startPoint.current.y / canvas.height, radius: radius / canvas.width, color: strokeColor, strokeWidth };
            }
        }

        if (payload) {
            const action: SendBoardActionRequest = { boardId, instanceId, type: ActionType.OBJECT_ADD, payload };
            onDraw(action);
        }
        
        currentPath.current = [];
        startPoint.current = null;
    };
    
    // --- Replay Function (No changes here) ---
    const replayDrawAction = (payload: ActionPayload, targetCtx: CanvasRenderingContext2D, targetCanvas: HTMLCanvasElement) => {
        targetCtx.globalCompositeOperation = 'source-over';
        if (payload.tool === 'brush' || payload.tool === 'eraser') {
            const lineData = payload;
            if (lineData.points.length < 2) return;
            targetCtx.strokeStyle = lineData.color;
            targetCtx.lineWidth = lineData.lineWidth;
            if (lineData.tool === 'eraser') {
                targetCtx.globalCompositeOperation = 'destination-out';
            }
            targetCtx.beginPath();
            targetCtx.moveTo(lineData.points[0].x * targetCanvas.width, lineData.points[0].y * targetCanvas.height);
            for (let i = 1; i < lineData.points.length; i++) {
                targetCtx.lineTo(lineData.points[i].x * targetCanvas.width, lineData.points[i].y * targetCanvas.height);
            }
            targetCtx.stroke();
        } else if (payload.tool === 'rectangle') {
            const rectData = payload;
            targetCtx.strokeStyle = rectData.color;
            targetCtx.lineWidth = rectData.strokeWidth;
            targetCtx.strokeRect(rectData.x * targetCanvas.width, rectData.y * targetCanvas.height, rectData.width * targetCanvas.width, rectData.height * targetCanvas.height);
        } else if (payload.tool === 'circle') {
            const circleData = payload;
            targetCtx.strokeStyle = circleData.color;
            targetCtx.lineWidth = circleData.strokeWidth;
            targetCtx.beginPath();
            targetCtx.arc(circleData.x * targetCanvas.width, circleData.y * targetCanvas.height, circleData.radius * targetCanvas.width, 0, 2 * Math.PI);
            targetCtx.stroke();
        }
        targetCtx.globalCompositeOperation = 'source-over';
    };

    // --- JSX (No changes here) ---
    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas ref={mainCanvasRef} width={dimensions.width} height={dimensions.height} style={{ position: 'absolute', top: 0, left: 0, backgroundColor: '#222' }} />
            <canvas
                ref={previewCanvasRef}
                width={dimensions.width}
                height={dimensions.height}
                onMouseDown={startDrawing}
                onMouseUp={finishDrawing}
                onMouseMove={draw}
                onMouseLeave={finishDrawing}
                style={{ position: 'absolute', top: 0, left: 0, cursor: 'crosshair' }}
            />
        </div>
    );
};

export default BoardCanvas;