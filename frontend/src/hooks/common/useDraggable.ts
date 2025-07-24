// File: frontend/src/hooks/useDraggable.ts
import { DEFAULT_DRAWING_CONFIG } from 'constants/board.constants';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseDraggableProps {
    containerRef: React.RefObject<HTMLElement | null>;
}

export const useDraggable = ({ containerRef }: UseDraggableProps) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const elementRef = useRef<HTMLDivElement>(null);

    const dragInfo = useRef({
        isDragging: false,
        startMouseX: 0,
        startMouseY: 0,
        startElementX: 0,
        startElementY: 0,
    });

    useEffect(() => {
        const container = containerRef.current;
        const element = elementRef.current;
        if (container && element) {
            const containerWidth = container.offsetWidth;
            const elementWidth = element.offsetWidth;
            const initialX = (containerWidth - elementWidth) / 1.15;
            setPosition({ x: initialX, y: DEFAULT_DRAWING_CONFIG.TOOLBAR_INITIAL_Y_POSITION });
        }
    }, [containerRef]);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!dragInfo.current.isDragging || !elementRef.current || !containerRef.current) return;

            const deltaX = e.clientX - dragInfo.current.startMouseX;
            const deltaY = e.clientY - dragInfo.current.startMouseY;

            const newX = dragInfo.current.startElementX + deltaX;
            const newY = dragInfo.current.startElementY + deltaY;

            const containerRect = containerRef.current.getBoundingClientRect();
            const elementRect = elementRef.current.getBoundingClientRect();

            const minX = 0;
            const maxX = containerRect.width - elementRect.width;
            const minY = 0;
            const maxY = containerRect.height - elementRect.height;

            const clampedX = Math.max(minX, Math.min(newX, maxX));
            const clampedY = Math.max(minY, Math.min(newY, maxY));

            setPosition({ x: clampedX, y: clampedY });
        },
        [containerRef]
    );

    const handleMouseUp = useCallback(() => {
        document.body.style.cursor = 'default';
        dragInfo.current.isDragging = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLButtonElement) {
                return;
            }

            document.body.style.cursor = 'move';
            dragInfo.current = {
                isDragging: true,
                startMouseX: e.clientX,
                startMouseY: e.clientY,
                startElementX: position.x,
                startElementY: position.y,
            };
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        },
        [handleMouseMove, handleMouseUp, position.x, position.y]
    );

    return {
        draggableRef: elementRef,
        handleMouseDown,
        style: {
            position: 'absolute' as const,
            top: `${position.y}px`,
            left: `${position.x}px`,
        },
    };
};
