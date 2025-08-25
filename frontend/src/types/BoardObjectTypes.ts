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
    tool: 'square' | 'rectangle';
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

export interface TrianglePayload {
    instanceId: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x3: number;
    y3: number;
    color: string;
    strokeWidth: number;
    tool: 'triangle';
}

export interface PolygonPayload {
    instanceId: string;
    x: number;
    y: number;
    radius: number;
    sides: number;
    color: string;
    strokeWidth: number;
    tool: 'pentagon' | 'hexagon' | 'star';
}

export interface TextBoxPayload {
    instanceId: string;
    x: number;        // Rectangle top-left (normalized)
    y: number;        // Rectangle top-left (normalized)
    width: number;    // Rectangle width (normalized)
    height: number;   // Rectangle height (normalized)
    text: string;     // Text content
    fontSize: number; // From toolbar slider (12-48px)
    color: string;
    tool: 'text';
}

export interface FillPayload {
    instanceId: string;
    x: number;
    y: number;
    color: string;
    tool: 'fill';
}

export interface StraightLinePayload {
    instanceId: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
    strokeWidth: number;
    tool: 'line' | 'dottedLine';
    dashPattern?: number[]; // For dotted line
}

export interface ArrowPayload {
    instanceId: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
    strokeWidth: number;
    tool: 'arrow';
}

export type ActionPayload = 
  | LinePayload 
  | RectanglePayload 
  | CirclePayload 
  | TrianglePayload 
  | PolygonPayload 
  | TextBoxPayload 
  | FillPayload
  | StraightLinePayload
  | ArrowPayload;

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
