// File: frontend/src/context/BoardContext.ts
import { createContext } from 'react';
import { useBoard } from '../hooks/useBoard';

// This file now ONLY defines the shape (type) and creates the context object.
// It contains no React components.

export type BoardContextType = ReturnType<typeof useBoard>;

export const BoardContext = createContext<BoardContextType | undefined>(undefined);