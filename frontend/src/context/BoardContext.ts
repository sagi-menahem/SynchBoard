// File: frontend/src/context/BoardContext.ts

import { createContext } from 'react';
import { useBoardSync } from '../hooks/useBoard'; // Import the new hook to infer its return type

export type BoardContextType = ReturnType<typeof useBoardSync>;

export const BoardContext = createContext<BoardContextType | undefined>(undefined);