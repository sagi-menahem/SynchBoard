// File: frontend/src/context/BoardContext.ts

import { createContext } from 'react';
import { useBoard } from '../hooks/useBoard';

export type BoardContextType = ReturnType<typeof useBoard>;

export const BoardContext = createContext<BoardContextType | undefined>(undefined);