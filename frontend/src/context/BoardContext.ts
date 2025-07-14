// File: frontend/src/context/BoardContext.ts

import { createContext } from 'react';
import { useBoardSync } from '../hooks/useBoardSync';

export type BoardContextType = ReturnType<typeof useBoardSync>;

export const BoardContext = createContext<BoardContextType | undefined>(undefined);