// File: frontend/src/hooks/board/workspace/useCanvasEvents.ts
import { TOOLS, type TOOL_LIST } from 'constants/board.constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SendBoardActionRequest } from 'types/boardObject.types';

type Tool = (typeof TOOL_LIST)[number];
type Point = { x: number; y: number };

interface UseCanvasEventsProps {
    previewCanvasRef: React.RefObject<HTMLCanvasElement>;
    tool: Tool;
    strokeWidth: number;
    strokeColor: string;
    onDraw: (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => void;
    senderId: string;
}

export const useCanvasEvents = ({
    previewCanvasRef,
    tool,
    strokeWidth,
    strokeColor,
    onDraw,
    senderId,
}: UseCanvasEventsProps) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const startPoint = useRef<Point | null>(null);
    const currentPath = useRef<Point[]>([]);

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
        [tool, previewCanvasRef]
    );

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
            const coords = getCoords(event);
            if (!coords) return;

            // Drawing logic would go here
            // This is a simplified version - the full implementation would include
            // the preview rendering logic from the original useCanvas
        };

        const handleMouseUp = () => {
            if (!isDrawing) return;
            setIsDrawing(false);

            // Send draw action logic would go here
            // This would include the logic to create and send the actual draw action
        };

        if (isDrawing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDrawing, tool, strokeColor, strokeWidth, onDraw, senderId, previewCanvasRef]);

    return {
        handleMouseDown,
        isDrawing,
    };
};
