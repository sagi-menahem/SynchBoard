// File: frontend/src/context/BoardContext.ts
import { useBoardSync } from 'hooks/useBoardSync';
import { createContext } from 'react';

export type BoardContextType = ReturnType<typeof useBoardSync>;

export const BoardContext = createContext<BoardContextType | undefined>(undefined);