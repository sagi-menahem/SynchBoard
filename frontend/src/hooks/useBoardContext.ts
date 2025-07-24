// File: frontend/src/hooks/useBoardContext.ts
import { useContext } from 'react';

import { BoardContext } from 'context/BoardContext.ts';

export const useBoardContext = () => {
    const context = useContext(BoardContext);
    if (context === undefined) {
        throw new Error('useBoardContext must be used within a BoardProvider');
    }
    return context;
};
