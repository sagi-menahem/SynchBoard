import { createContext } from 'react';

import { useBoardWorkspace } from './hooks/workspace';

export type BoardContextType = ReturnType<typeof useBoardWorkspace>;

export const BoardContext = createContext<BoardContextType | undefined>(undefined);
