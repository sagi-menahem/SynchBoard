import { useLayoutEffect, useState } from 'react';

interface UseCanvasDimensionsProps {
    containerRef: React.RefObject<HTMLDivElement | null>;
}

export const useCanvasDimensions = ({ containerRef }: UseCanvasDimensionsProps) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, [containerRef]);

    return { dimensions };
};
