import { useEffect } from 'react';

import type { ActionPayload, SendBoardActionRequest } from 'types/BoardObjectTypes';
import type { Tool } from 'types/CommonTypes';

import { useCanvasCore } from './useCanvasCore';
import { useCanvasInteractions } from './useCanvasInteractions';
import { useCanvasRendering } from './useCanvasRendering';

interface UseCanvasProps {
    instanceId: string;
    tool: Tool;
    strokeColor: string;
    strokeWidth: number;
    objects: ActionPayload[];
    onDraw: (action: Omit<SendBoardActionRequest, 'boardId' | 'instanceId'>) => void;
    isConnected?: boolean;
}

export const useCanvas = ({
    instanceId: senderId,
    tool,
    strokeColor,
    strokeWidth,
    objects,
    onDraw,
    isConnected = true,
}: UseCanvasProps) => {
    const { dimensions, refs, drawingState, utils } = useCanvasCore();
    const { mainCanvasRef, previewCanvasRef, containerRef, contextRef, previewContextRef } = refs;

    useEffect(() => {
        if (dimensions.width > 0 && dimensions.height > 0) {
            contextRef.current = utils.setupCanvasContext(mainCanvasRef.current);
            previewContextRef.current = utils.setupCanvasContext(previewCanvasRef.current);
        }
    }, [dimensions, mainCanvasRef, previewCanvasRef, contextRef, previewContextRef, utils]);

    useCanvasRendering({
        mainCanvasRef,
        contextRef,
        objects,
        dimensions,
        replayDrawAction: utils.replayDrawAction,
    });

    const { handleMouseDown } = useCanvasInteractions({
        previewCanvasRef,
        previewContextRef,
        tool,
        strokeWidth,
        strokeColor,
        onDraw,
        senderId,
        drawingState,
        getMouseCoordinates: utils.getMouseCoordinates,
        isShapeSizeValid: utils.isShapeSizeValid,
        isRadiusValid: utils.isRadiusValid,
        isConnected,
    });

    return {
        mainCanvasRef,
        previewCanvasRef,
        containerRef,
        dimensions,
        handleMouseDown,
    };
};
