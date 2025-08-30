// Board Feature Barrel Exports

// Components - Workspace
export { default as BoardWorkspace } from './components/workspace/BoardWorkspace';
export { default as Canvas } from './components/workspace/Canvas';
export { CanvasToolSection } from './components/workspace/CanvasToolSection';
export { default as TextInputOverlay } from './components/workspace/TextInputOverlay';

// Components - List
export { default as BoardCard } from './components/list/BoardCard';
export { default as CreateBoardForm } from './components/list/CreateBoardForm';
export { default as BoardImageUpload } from './components/list/BoardImageUpload';
export { default as MemberInviteInput } from './components/list/MemberInviteInput';

// Components - Details
export { default as BoardDetailsHeader } from './components/details/BoardDetailsHeader';
export { default as CanvasSettingsSection } from './components/details/CanvasSettingsSection';
export { default as MemberList } from './components/details/MemberList';
export { default as InviteMemberForm } from './components/details/InviteMemberForm';

// Hooks - Workspace
export { useBoardWorkspace } from './hooks/workspace/useBoardWorkspace';
export { useBoardActions } from './hooks/workspace/useBoardActions';
export { useBoardDataManager } from './hooks/workspace/useBoardDataManager';
export { useCanvas } from './hooks/workspace/canvas/useCanvas';
export { useCanvasState } from './hooks/workspace/canvas/useCanvasState';
export { useCanvasEvents } from './hooks/workspace/canvas/useCanvasEvents';
export { useDrawingTools } from './hooks/workspace/canvas/useDrawingTools';
export { useCanvasPreview } from './hooks/workspace/canvas/useCanvasPreview';

// Hooks - Details & Management
export { useBoardDetails } from './hooks/details/useBoardDetails';
export { useBoardList } from './hooks/management/useBoardList';
export { useCreateBoardForm } from './hooks/management/useCreateBoardForm';
export { useBoardContext } from './hooks/context/useBoardContext';

// Context
export { BoardProvider } from './BoardProvider';
export { BoardContext } from './BoardContext';

// Pages
export { default as BoardPage } from './pages/BoardPage';
export { default as BoardListPage } from './pages/BoardListPage';
export { default as BoardDetailsPage } from './pages/BoardDetailsPage';

// Services
export * as BoardService from './services/boardService';

// Utils
export * from './utils/CanvasUtils';

// Types - Re-export for convenience
export type * from './types/BoardTypes';
export type * from './types/BoardObjectTypes';
export type * from './types/ToolbarTypes';