import { useRef, useState } from 'react';

interface Point {
    x: number;
    y: number;
}

export interface DrawingState {
    isDrawing: boolean;
    setIsDrawing: (drawing: boolean) => void;
    startPoint: React.RefObject<Point | null>;
    currentPath: React.RefObject<Point[]>;
    resetDrawingState: () => void;
}

export const useCanvasDrawingState = (): DrawingState => {
    const [isDrawing, setIsDrawing] = useState(false);
    const startPoint = useRef<Point | null>(null);
    const currentPath = useRef<Point[]>([]);

    const resetDrawingState = () => {
        setIsDrawing(false);
        startPoint.current = null;
        currentPath.current = [];
    };

    return {
        isDrawing,
        setIsDrawing,
        startPoint,
        currentPath,
        resetDrawingState,
    };
};