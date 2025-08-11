import { useEffect } from 'react';

import type { TOOL_LIST } from 'constants/BoardConstants';
import type { ActionPayload, SendBoardActionRequest } from 'types/boardObject.types';

import { useCanvasDimensions } from './useCanvasDimensions';
import { useCanvasEvents } from './useCanvasEvents';
import { useCanvasRefs } from './useCanvasRefs';
import { useCanvasRendering } from './useCanvasRendering';
import { useCanvasUtils } from './useCanvasUtils';

type Tool = (typeof TOOL_LIST)[number];

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
    // First, create refs
    const { mainCanvasRef, previewCanvasRef, containerRef, contextRef, previewContextRef } = useCanvasRefs();

    // Get actual dimensions from container
    const { dimensions } = useCanvasDimensions({ containerRef });

    // Get utils functions
    const { setupCanvasContext } = useCanvasUtils();

    // Update contexts when dimensions change
    useEffect(() => {
        if (dimensions.width > 0 && dimensions.height > 0) {
            contextRef.current = setupCanvasContext(mainCanvasRef.current);
            previewContextRef.current = setupCanvasContext(previewCanvasRef.current);
        }
    }, [dimensions, mainCanvasRef, previewCanvasRef, contextRef, previewContextRef, setupCanvasContext]);

    // Handle canvas rendering
    useCanvasRendering({
        mainCanvasRef,
        contextRef,
        objects,
        dimensions,
    });

    // Handle canvas events
    const { handleMouseDown } = useCanvasEvents({
        previewCanvasRef,
        previewContextRef,
        tool,
        strokeWidth,
        strokeColor,
        onDraw,
        senderId,
    });

    return {
        mainCanvasRef,
        previewCanvasRef,
        containerRef,
        dimensions,
        handleMouseDown,
    };
};
