import { useCallback } from 'react';

import { TOOLS } from 'constants/BoardConstants';
import type { Tool } from 'types/CommonTypes';

import type { DrawingState } from './useCanvasDrawingState';

interface UseCanvasMouseDownProps {
    tool: Tool;
    previewCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    drawingState: DrawingState;
}

export const useCanvasMouseDown = ({
    tool,
    previewCanvasRef,
    drawingState,
}: UseCanvasMouseDownProps) => {
    const { setIsDrawing, startPoint, currentPath } = drawingState;

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
        [tool, previewCanvasRef, setIsDrawing, startPoint, currentPath]
    );

    return { handleMouseDown };
};