// File: frontend/src/components/board/BoardCanvas.tsx

import React, { useRef, useEffect, useState } from 'react';
import { ActionType, type BoardActionResponse, type SendBoardActionRequest } from '../../types/websocket.types';

interface BoardCanvasProps {
  boardId: number;
  instanceId: string;
  onDraw: (action: SendBoardActionRequest) => void;
  receivedAction: BoardActionResponse | null;
}

type Point = { x: number; y: number };

const BoardCanvas: React.FC<BoardCanvasProps> = ({ boardId, instanceId, onDraw, receivedAction }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const currentPath = useRef<Point[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.7;
        const context = canvas.getContext('2d');
        if (!context) return;
        context.lineCap = 'round';
        context.strokeStyle = 'white';
        context.lineWidth = 3;
        contextRef.current = context;
    }, []);

    useEffect(() => {
        if (receivedAction) {
            replayDrawAction(receivedAction.payload);
        }
    }, [receivedAction]);

    const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current?.beginPath();
        contextRef.current?.moveTo(offsetX, offsetY);
        setIsDrawing(true);
        currentPath.current = [{ x: offsetX, y: offsetY }];
    };

    const finishDrawing = () => {
        if (!isDrawing || currentPath.current.length < 2) {
            setIsDrawing(false);
            currentPath.current = [];
            return;
        }
        
        const pathPayload = {
            points: currentPath.current,
            color: String(contextRef.current?.strokeStyle || 'white'),
            lineWidth: contextRef.current?.lineWidth,
        };

        const action: SendBoardActionRequest = {
            boardId: boardId,
            instanceId: instanceId,
            type: ActionType.OBJECT_ADD,
            payload: pathPayload,
        };
        onDraw(action);

        contextRef.current?.closePath();
        setIsDrawing(false);
        currentPath.current = [];
    };

    const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current?.lineTo(offsetX, offsetY);
        contextRef.current?.stroke();
        currentPath.current.push({ x: offsetX, y: offsetY });
    };
    
    const replayDrawAction = (payload: unknown) => {
        if (
            typeof payload === 'object' &&
            payload !== null &&
            'points' in payload &&
            Array.isArray((payload as { points: unknown }).points)
        ) {
            const pathData = payload as { points: Point[], color?: string, lineWidth?: number };
            const ctx = contextRef.current;
            if (!ctx || pathData.points.length === 0) return;

            const originalStyle = { strokeStyle: ctx.strokeStyle, lineWidth: ctx.lineWidth };
            ctx.strokeStyle = pathData.color || originalStyle.strokeStyle;
            ctx.lineWidth = pathData.lineWidth || originalStyle.lineWidth;

            ctx.beginPath();
            ctx.moveTo(pathData.points[0].x, pathData.points[0].y);
            for (let i = 1; i < pathData.points.length; i++) {
                ctx.lineTo(pathData.points[i].x, pathData.points[i].y);
            }
            ctx.stroke();
            ctx.closePath();

            ctx.strokeStyle = originalStyle.strokeStyle;
            ctx.lineWidth = originalStyle.lineWidth;
        }
    };

    return (
        <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
            onMouseLeave={finishDrawing}
            style={{ border: '1px solid #555', backgroundColor: '#222' }}
        />
    );
};

export default BoardCanvas;