import type { SendBoardActionRequest } from 'types/BoardObjectTypes';
import type { Tool } from 'types/CommonTypes';

import { useCanvasDrawingState } from './useCanvasDrawingState';
import { useCanvasMouseDown } from './useCanvasMouseDown';
import { useCanvasMouseEvents } from './useCanvasMouseEvents';

interface UseCanvasEventsProps {
    previewCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    previewContextRef: React.RefObject<CanvasRenderingContext2D | null>;
    tool: Tool;
    strokeWidth: number;
    strokeColor: string;
    onDraw: (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => void;
    senderId: string;
}

export const useCanvasEvents = ({
    previewCanvasRef,
    previewContextRef,
    tool,
    strokeWidth,
    strokeColor,
    onDraw,
    senderId,
}: UseCanvasEventsProps) => {
    const drawingState = useCanvasDrawingState();

    const { handleMouseDown } = useCanvasMouseDown({
        tool,
        previewCanvasRef,
        drawingState,
    });

    useCanvasMouseEvents({
        previewCanvasRef,
        previewContextRef,
        tool,
        strokeWidth,
        strokeColor,
        onDraw,
        senderId,
        drawingState,
    });

    return {
        handleMouseDown,
        isDrawing: drawingState.isDrawing,
    };
};
