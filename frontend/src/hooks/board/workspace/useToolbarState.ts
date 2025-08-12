import { useState } from 'react';

import { DEFAULT_DRAWING_CONFIG, TOOLS } from 'constants/BoardConstants';
import type { Tool } from 'types/CommonTypes';

export const useToolbarState = () => {
    const [tool, setTool] = useState<Tool>(TOOLS.BRUSH);
    const [strokeColor, setStrokeColor] = useState<string>(DEFAULT_DRAWING_CONFIG.STROKE_COLOR);
    const [strokeWidth, setStrokeWidth] = useState<number>(DEFAULT_DRAWING_CONFIG.STROKE_WIDTH);

    return {
        tool,
        setTool,
        strokeColor,
        setStrokeColor,
        strokeWidth,
        setStrokeWidth,
    };
};
