// File: frontend/src/components/board/BoardCanvas.tsx

import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { ActionType, type BoardActionResponse, type SendBoardActionRequest } from '../../types/websocket.types';

// Interfaces
interface BoardCanvasProps {
  boardId: number;
  instanceId: string;
  onDraw: (action: SendBoardActionRequest) => void;
  receivedAction: BoardActionResponse | null;
  initialObjects: BoardActionResponse[];
}
type Point = { x: number; y: number };
interface LinePayload {
    points: Point[];
    color: string;
    lineWidth: number;
}

const BoardCanvas: React.FC<BoardCanvasProps> = ({ boardId, instanceId, onDraw, receivedAction, initialObjects }) => {
    const mainCanvasRef = useRef<HTMLCanvasElement>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const previewContextRef = useRef<CanvasRenderingContext2D | null>(null);
    
    const [isDrawing, setIsDrawing] = useState(false);
    const currentPath = useRef<Point[]>([]);
    const [renderedLines, setRenderedLines] = useState<LinePayload[]>([]);
    
    // 1. New state to hold the canvas dimensions
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // This effect observes the container size and updates the dimensions state
    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver(entries => {
            const entry = entries[0];
            const { width, height } = entry.contentRect;
            setDimensions({ width, height }); // Update state on resize
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, []);

    // This effect now redraws EVERYTHING when lines OR dimensions change
    useEffect(() => {
        const mainCanvas = mainCanvasRef.current;
        const previewCanvas = previewCanvasRef.current;
        const ctx = contextRef.current;

        if (!mainCanvas || !previewCanvas || !ctx) return;
        
        // Redraw all confirmed lines
        ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        renderedLines.forEach(line => replayDrawAction(line, ctx, mainCanvas));

    }, [renderedLines, dimensions]); // 2. Rerun this effect when dimensions change

    // Effect to set up contexts (runs only when dimensions change)
    useEffect(() => {
        const mainCanvas = mainCanvasRef.current;
        const previewCanvas = previewCanvasRef.current;
        if (!mainCanvas || !previewCanvas) return;

        const mainCtx = mainCanvas.getContext('2d');
        const previewCtx = previewCanvas.getContext('2d');
        if (mainCtx) {
            mainCtx.lineCap = 'round';
            contextRef.current = mainCtx;
        }
        if (previewCtx) {
            previewCtx.lineCap = 'round';
            previewContextRef.current = previewCtx;
        }
    }, [dimensions]);

    // Effect to populate initial objects
    useEffect(() => {
        const initialLinePayloads = initialObjects.map(action => action.payload as LinePayload);
        setRenderedLines(initialLinePayloads);
    }, [initialObjects]);
    
    // Effect to add a newly received line
    useEffect(() => {
        if (receivedAction?.type === ActionType.OBJECT_ADD) {
            const newLinePayload = receivedAction.payload as LinePayload;
            setRenderedLines(prevLines => [...prevLines, newLinePayload]);
        }
    }, [receivedAction]);

    // ... (startDrawing, finishDrawing, draw, and replayDrawAction functions remain mostly the same)
    const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = mainCanvasRef.current;
        const previewCtx = previewContextRef.current;
        if (!canvas || !previewCtx) return;
        const { offsetX, offsetY } = nativeEvent;
        previewCtx.clearRect(0, 0, canvas.width, canvas.height);
        previewCtx.beginPath();
        previewCtx.moveTo(offsetX, offsetY);
        setIsDrawing(true);
        currentPath.current = [{ x: offsetX / canvas.width, y: offsetY / canvas.height }];
    };

    const finishDrawing = () => {
        if (!isDrawing || currentPath.current.length < 2) { setIsDrawing(false); return; }
        const previewCtx = previewContextRef.current;
        previewCtx?.clearRect(0, 0, previewCtx.canvas.width, previewCtx.canvas.height);
        const pathPayload = { points: currentPath.current, color: 'white', lineWidth: 3 };
        const action: SendBoardActionRequest = { boardId, instanceId, type: ActionType.OBJECT_ADD, payload: pathPayload };
        onDraw(action);
        setIsDrawing(false);
        currentPath.current = [];
    };

    const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = mainCanvasRef.current;
        const previewCtx = previewContextRef.current;
        if (!canvas || !previewCtx) return;
        const { offsetX, offsetY } = nativeEvent;
        previewCtx.strokeStyle = 'white';
        previewCtx.lineWidth = 3;
        previewCtx.lineTo(offsetX, offsetY);
        previewCtx.stroke();
        currentPath.current.push({ x: offsetX / canvas.width, y: offsetY / canvas.height });
    };
    
    const replayDrawAction = (payload: unknown, targetCtx: CanvasRenderingContext2D, targetCanvas: HTMLCanvasElement) => {
        if (typeof payload === 'object' && payload && 'points' in payload && Array.isArray((payload as { points: any[] }).points)) {
            const pathData = payload as LinePayload;
            if (pathData.points.length === 0) return;
            targetCtx.strokeStyle = pathData.color;
            targetCtx.lineWidth = pathData.lineWidth;
            targetCtx.beginPath();
            targetCtx.moveTo(pathData.points[0].x * targetCanvas.width, pathData.points[0].y * targetCanvas.height);
            for (let i = 1; i < pathData.points.length; i++) {
                targetCtx.lineTo(pathData.points[i].x * targetCanvas.width, pathData.points[i].y * targetCanvas.height);
            }
            targetCtx.stroke();
        }
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* 3. Canvases now get their size from the state */}
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