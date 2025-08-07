import { createContext } from 'react';

import { useBoardSync } from 'hooks/board/workspace/useBoardSync';

export type BoardContextType = ReturnType<typeof useBoardSync>;

export const BoardContext = createContext<BoardContextType | undefined>(undefined);
