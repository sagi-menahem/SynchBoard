import { useCallback, useEffect, useRef, useState } from 'react';

import { CANVAS_CONFIG, TOOLS, type TOOL_LIST } from 'constants/BoardConstants';
import {
    ActionType,
    type CirclePayload,
    type LinePayload,
    type RectanglePayload,
    type SendBoardActionRequest,
} from 'types/BoardObjectTypes';

import { useCanvasUtils } from './useCanvasUtils';

type Tool = (typeof TOOL_LIST)[number];
interface Point {
    x: number;
    y: number;
}

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
    const [isDrawing, setIsDrawing] = useState(false);
    const startPoint = useRef<Point | null>(null);
    const currentPath = useRef<Point[]>([]);

    const { getMouseCoordinates, isShapeSizeValid, isRadiusValid } = useCanvasUtils();

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

        const handleMouseMove = (event: MouseEvent) => {
            if (!isDrawing) return;
            const previewCtx = previewContextRef.current;
            const coords = getMouseCoordinates(event, canvas);
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
            const coords = getMouseCoordinates(event, canvas);
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
                if (isShapeSizeValid(rectWidth, rectHeight)) {
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
                if (isRadiusValid(radius)) {
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
    }, [
        isDrawing,
        onDraw,
        senderId,
        strokeColor,
        strokeWidth,
        tool,
        previewCanvasRef,
        previewContextRef,
        getMouseCoordinates,
        isShapeSizeValid,
        isRadiusValid,
    ]);

    return {
        handleMouseDown,
        isDrawing,
    };
};
