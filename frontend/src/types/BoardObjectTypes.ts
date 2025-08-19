export const ActionType = {
    OBJECT_ADD: 'OBJECT_ADD',
    OBJECT_UPDATE: 'OBJECT_UPDATE',
    OBJECT_DELETE: 'OBJECT_DELETE',
} as const;

export type ActionType = (typeof ActionType)[keyof typeof ActionType];

interface Point {
    x: number;
    y: number;
}

export interface LinePayload {
    instanceId: string;
    points: Point[];
    color: string;
    lineWidth: number;
    tool: 'brush' | 'eraser';
    transactionId?: string;
    transactionStatus?: 'sending' | 'processing' | 'confirmed' | 'failed';
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
    transactionId?: string;
    transactionStatus?: 'sending' | 'processing' | 'confirmed' | 'failed';
}

export interface CirclePayload {
    instanceId: string;
    x: number;
    y: number;
    radius: number;
    color: string;
    strokeWidth: number;
    tool: 'circle';
    transactionId?: string;
    transactionStatus?: 'sending' | 'processing' | 'confirmed' | 'failed';
}

export type ActionPayload = LinePayload | RectanglePayload | CirclePayload;

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
