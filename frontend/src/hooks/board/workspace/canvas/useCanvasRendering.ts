import { useEffect, useRef, useCallback } from 'react';

import type { ActionPayload } from 'types/BoardObjectTypes';

interface UseCanvasRenderingProps {
    mainCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    contextRef: React.RefObject<CanvasRenderingContext2D | null>;
    objects: ActionPayload[];
    dimensions: { width: number; height: number };
    replayDrawAction: (payload: ActionPayload, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
}

export const useCanvasRendering = ({ 
    mainCanvasRef, 
    contextRef, 
    objects, 
    dimensions, 
    replayDrawAction 
}: UseCanvasRenderingProps) => {
    const previousObjectsRef = useRef<ActionPayload[]>([]);
    const renderingFrameRef = useRef<number | null>(null);
    const lastRenderedCountRef = useRef<number>(0);

    const performIncrementalRender = useCallback(() => {
        const canvas = mainCanvasRef.current;
        const ctx = contextRef.current;
        if (!canvas || !ctx) return;

        const previousObjects = previousObjectsRef.current;
        const currentObjects = objects;

        // If objects array length decreased, we need full re-render
        if (currentObjects.length < previousObjects.length) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            currentObjects.forEach((obj) => replayDrawAction(obj, ctx, canvas));
            lastRenderedCountRef.current = currentObjects.length;
        } else {
            // Incremental render: only render new objects
            const newObjectsCount = currentObjects.length - lastRenderedCountRef.current;
            if (newObjectsCount > 0) {
                const newObjects = currentObjects.slice(-newObjectsCount);
                newObjects.forEach((obj) => replayDrawAction(obj, ctx, canvas));
                lastRenderedCountRef.current = currentObjects.length;
            }
        }

        previousObjectsRef.current = [...currentObjects];
    }, [objects, replayDrawAction, mainCanvasRef, contextRef]);

    const scheduleRender = useCallback(() => {
        if (renderingFrameRef.current) {
            cancelAnimationFrame(renderingFrameRef.current);
        }
        
        renderingFrameRef.current = requestAnimationFrame(() => {
            performIncrementalRender();
            renderingFrameRef.current = null;
        });
    }, [performIncrementalRender]);

    // Handle dimension changes - requires full re-render
    useEffect(() => {
        const canvas = mainCanvasRef.current;
        const ctx = contextRef.current;
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        objects.forEach((obj) => replayDrawAction(obj, ctx, canvas));
        lastRenderedCountRef.current = objects.length;
        previousObjectsRef.current = [...objects];
    }, [dimensions, replayDrawAction, mainCanvasRef, contextRef]);

    // Handle object changes with incremental rendering
    useEffect(() => {
        scheduleRender();
        
        return () => {
            if (renderingFrameRef.current) {
                cancelAnimationFrame(renderingFrameRef.current);
            }
        };
    }, [objects, scheduleRender]);
};
