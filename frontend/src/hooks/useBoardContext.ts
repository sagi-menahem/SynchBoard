// File: frontend/src/hooks/useBoardContext.ts
import { BoardContext } from "context/BoardContext.ts";
import { useContext } from "react";

export const useBoardContext = () => {
    const context = useContext(BoardContext);
    if (context === undefined) {
        throw new Error('useBoardContext must be used within a BoardProvider');
    }
    return context;
};