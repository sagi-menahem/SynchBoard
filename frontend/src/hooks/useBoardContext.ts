// File: frontend/src/hooks/useBoardContext.ts
import { useContext } from "react";
import { BoardContext } from "../context/BoardContext.ts";
/**
 * A custom hook to easily consume the BoardContext.
 * It ensures the context is used within a BoardProvider and provides a clean API.
 */
export const useBoardContext = () => {
    const context = useContext(BoardContext);
    if (context === undefined) {
        throw new Error('useBoardContext must be used within a BoardProvider');
    }
    return context;
};