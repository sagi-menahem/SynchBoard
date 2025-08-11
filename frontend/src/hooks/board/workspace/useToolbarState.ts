import { useState } from 'react';

import { DEFAULT_DRAWING_CONFIG, TOOLS, type TOOL_LIST } from 'constants/BoardConstants';

type Tool = (typeof TOOL_LIST)[number];

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
