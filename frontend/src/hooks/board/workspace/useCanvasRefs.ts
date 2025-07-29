// File: frontend/src/hooks/board/workspace/useCanvasRefs.ts
import { useRef } from 'react';

interface CanvasRefs {
    mainCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    previewCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
    contextRef: React.RefObject<CanvasRenderingContext2D | null>;
    previewContextRef: React.RefObject<CanvasRenderingContext2D | null>;
}

export const useCanvasRefs = (): CanvasRefs => {
    const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const previewContextRef = useRef<CanvasRenderingContext2D | null>(null);

    return {
        mainCanvasRef,
        previewCanvasRef,
        containerRef,
        contextRef,
        previewContextRef,
    };
};
