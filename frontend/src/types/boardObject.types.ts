// File: frontend/src/types/boardObject.types.ts

export const ActionType = {
    OBJECT_ADD: 'OBJECT_ADD',
    OBJECT_UPDATE: 'OBJECT_UPDATE',
    OBJECT_DELETE: 'OBJECT_DELETE',
} as const;

export type ActionType = typeof ActionType[keyof typeof ActionType];

export interface SendBoardActionRequest {
    boardId: number;
    type: ActionType;
    payload: unknown;
    instanceId: string;
}

export interface BoardActionResponse {
    type: ActionType;
    payload: unknown;
    sender: string;
    instanceId: string;
}