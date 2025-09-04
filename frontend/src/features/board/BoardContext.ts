import { createContext } from 'react';

import { useBoardWorkspace } from './hooks/workspace';

/**
 * Type definition for the board context providing collaborative whiteboard state and actions.
 * Encapsulates all board-related functionality including canvas management, drawing tools,
 * real-time collaboration, member management, and WebSocket communication for synchronized
 * drawing operations across multiple users.
 */
export type BoardContextType = ReturnType<typeof useBoardWorkspace>;

export const BoardContext = createContext<BoardContextType | undefined>(undefined);
