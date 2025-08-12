import { useEffect } from 'react';

import type { ActionPayload, SendBoardActionRequest } from 'types/BoardObjectTypes';
import type { Tool } from 'types/CommonTypes';

import { useCanvasDimensions } from './useCanvasDimensions';
import { useCanvasEvents } from './useCanvasEvents';
import { useCanvasRefs } from './useCanvasRefs';
import { useCanvasRendering } from './useCanvasRendering';
import { useCanvasUtils } from './useCanvasUtils';

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
    const { mainCanvasRef, previewCanvasRef, containerRef, contextRef, previewContextRef } = useCanvasRefs();

    const { dimensions } = useCanvasDimensions({ containerRef });

    const { setupCanvasContext } = useCanvasUtils();

    useEffect(() => {
        if (dimensions.width > 0 && dimensions.height > 0) {
            contextRef.current = setupCanvasContext(mainCanvasRef.current);
            previewContextRef.current = setupCanvasContext(previewCanvasRef.current);
        }
    }, [dimensions, mainCanvasRef, previewCanvasRef, contextRef, previewContextRef, setupCanvasContext]);

    useCanvasRendering({
        mainCanvasRef,
        contextRef,
        objects,
        dimensions,
    });

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
