// File: frontend/src/context/BoardContext.ts
import { useBoardSync } from 'hooks/board/workspace/useBoardSync';
import { createContext } from 'react';

export type BoardContextType = ReturnType<typeof useBoardSync>;

export const BoardContext = createContext<BoardContextType | undefined>(undefined);
