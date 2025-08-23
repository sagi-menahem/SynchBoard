export const ActionType = {
  OBJECT_ADD: 'OBJECT_ADD',
  OBJECT_UPDATE: 'OBJECT_UPDATE',
  OBJECT_DELETE: 'OBJECT_DELETE',
} as const;

export type ActionType = (typeof ActionType)[keyof typeof ActionType];

export interface Point {
    x: number;
    y: number;
}

export interface LinePayload {
    instanceId: string;
    points: Point[];
    color: string;
    lineWidth: number;
    tool: 'brush' | 'eraser';
}

export interface RectanglePayload {
    instanceId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    strokeWidth: number;
    tool: 'rectangle';
}

export interface CirclePayload {
    instanceId: string;
    x: number;
    y: number;
    radius: number;
    color: string;
    strokeWidth: number;
    tool: 'circle';
}

export type ActionPayload = LinePayload | RectanglePayload | CirclePayload;

export type EnhancedActionPayload = ActionPayload & {
    transactionId?: string;
    transactionStatus?: 'sending' | 'failed' | 'confirmed' | 'pending';
}

export interface SendBoardActionRequest {
    boardId: number;
    type: ActionType;
    payload: Omit<ActionPayload, 'instanceId'>;
    instanceId: string;
    sender: string;
}

export interface BoardActionResponse {
    type: ActionType;
    payload: object;
    sender: string;
    instanceId: string;
}
