/**
 * Enumeration of possible action types for board object operations.
 * These constants define the types of operations that can be performed on canvas objects
 * during collaborative drawing sessions.
 */
export const ActionType = {
  OBJECT_ADD: 'OBJECT_ADD',
  OBJECT_UPDATE: 'OBJECT_UPDATE',
  OBJECT_DELETE: 'OBJECT_DELETE',
} as const;

/**
 * Type representing the possible action types for board object operations.
 * Derived from the ActionType constant to ensure type safety.
 */
export type ActionType = (typeof ActionType)[keyof typeof ActionType];

/**
 * Represents a 2D coordinate point on the canvas.
 * Used for positioning and path tracking in drawing operations.
 */
export interface Point {
  // X coordinate position on the canvas (normalized 0-1 or pixel values)
  x: number;
  // Y coordinate position on the canvas (normalized 0-1 or pixel values)
  y: number;
}

/**
 * Represents a line drawing object created with brush or eraser tools.
 * Contains the path data and styling information for freehand drawings.
 */
export interface LinePayload {
  // Unique identifier for this drawing instance
  instanceId: string;
  // Array of points forming the line path
  points: Point[];
  // Stroke color in hex or CSS format
  color: string;
  // Width of the line stroke in pixels
  lineWidth: number;
  // Drawing tool used to create this line
  tool: 'brush' | 'eraser';
}

/**
 * Represents a rectangular shape object on the canvas.
 * Supports both square and rectangle tools with configurable dimensions and styling.
 */
export interface RectanglePayload {
  // Unique identifier for this shape instance
  instanceId: string;
  // X coordinate of the top-left corner (normalized)
  x: number;
  // Y coordinate of the top-left corner (normalized)
  y: number;
  // Width of the rectangle (normalized)
  width: number;
  // Height of the rectangle (normalized)
  height: number;
  // Border color in hex or CSS format
  color: string;
  // Optional fill color for the shape interior
  fillColor?: string | null;
  // Width of the border stroke in pixels
  strokeWidth: number;
  // Shape tool used to create this rectangle
  tool: 'square' | 'rectangle';
}

/**
 * Represents a circular shape object on the canvas.
 * Defines the center point and radius for perfect circle rendering.
 */
export interface CirclePayload {
  // Unique identifier for this shape instance
  instanceId: string;
  // X coordinate of the circle center (normalized)
  x: number;
  // Y coordinate of the circle center (normalized)
  y: number;
  // Radius of the circle (normalized)
  radius: number;
  // Border color in hex or CSS format
  color: string;
  // Optional fill color for the shape interior
  fillColor?: string | null;
  // Width of the border stroke in pixels
  strokeWidth: number;
  // Shape tool identifier for circle
  tool: 'circle';
}

/**
 * Represents a triangular shape object on the canvas.
 * Defined by three vertex points to form the triangle.
 */
export interface TrianglePayload {
  // Unique identifier for this shape instance
  instanceId: string;
  // X coordinate of the first vertex (normalized)
  x1: number;
  // Y coordinate of the first vertex (normalized)
  y1: number;
  // X coordinate of the second vertex (normalized)
  x2: number;
  // Y coordinate of the second vertex (normalized)
  y2: number;
  // X coordinate of the third vertex (normalized)
  x3: number;
  // Y coordinate of the third vertex (normalized)
  y3: number;
  // Border color in hex or CSS format
  color: string;
  // Optional fill color for the shape interior
  fillColor?: string | null;
  // Width of the border stroke in pixels
  strokeWidth: number;
  // Shape tool identifier for triangle
  tool: 'triangle';
}

/**
 * Represents a regular polygon or star shape object on the canvas.
 * Supports pentagons, hexagons, and star shapes with configurable sides.
 */
export interface PolygonPayload {
  // Unique identifier for this shape instance
  instanceId: string;
  // X coordinate of the polygon center (normalized)
  x: number;
  // Y coordinate of the polygon center (normalized)
  y: number;
  // Radius from center to vertices (normalized)
  radius: number;
  // Number of sides/points for the polygon
  sides: number;
  // Border color in hex or CSS format
  color: string;
  // Optional fill color for the shape interior
  fillColor?: string | null;
  // Width of the border stroke in pixels
  strokeWidth: number;
  // Polygon tool type identifier
  tool: 'pentagon' | 'hexagon' | 'star';
}

/**
 * Represents a text box object on the canvas.
 * Contains text content with positioning and styling information.
 */
export interface TextBoxPayload {
  // Unique identifier for this text instance
  instanceId: string;
  // X coordinate of the text box top-left corner (normalized)
  x: number;
  // Y coordinate of the text box top-left corner (normalized)
  y: number;
  // Width of the text box area (normalized)
  width: number;
  // Height of the text box area (normalized)
  height: number;
  // Text content to display
  text: string;
  // Font size in pixels
  fontSize: number;
  // Text color in hex or CSS format
  color: string;
  // Text tool identifier
  tool: 'text';
}

/**
 * Represents a straight line object on the canvas.
 * Supports both solid and dotted line styles between two points.
 */
export interface StraightLinePayload {
  // Unique identifier for this line instance
  instanceId: string;
  // X coordinate of the line start point (normalized)
  x1: number;
  // Y coordinate of the line start point (normalized)
  y1: number;
  // X coordinate of the line end point (normalized)
  x2: number;
  // Y coordinate of the line end point (normalized)
  y2: number;
  // Line color in hex or CSS format
  color: string;
  // Width of the line stroke in pixels
  strokeWidth: number;
  // Line tool type identifier
  tool: 'line' | 'dottedLine';
  // Optional dash pattern for dotted lines [dash length, gap length]
  dashPattern?: number[];
}

/**
 * Represents an arrow object on the canvas.
 * Creates a line with an arrowhead at the end point for directional indication.
 */
export interface ArrowPayload {
  // Unique identifier for this arrow instance
  instanceId: string;
  // X coordinate of the arrow start point (normalized)
  x1: number;
  // Y coordinate of the arrow start point (normalized)
  y1: number;
  // X coordinate of the arrow end point with arrowhead (normalized)
  x2: number;
  // Y coordinate of the arrow end point with arrowhead (normalized)
  y2: number;
  // Arrow color in hex or CSS format
  color: string;
  // Width of the arrow line stroke in pixels
  strokeWidth: number;
  // Arrow tool identifier
  tool: 'arrow';
}

/**
 * Union type representing all possible drawing object payloads.
 * Used to type-safely handle any type of canvas object in the application.
 */
export type ActionPayload =
  | LinePayload
  | RectanglePayload
  | CirclePayload
  | TrianglePayload
  | PolygonPayload
  | TextBoxPayload
  | StraightLinePayload
  | ArrowPayload;

/**
 * Extended action payload with transaction tracking for optimistic updates.
 * Adds transaction metadata to track the synchronization state of drawing operations.
 */
export type EnhancedActionPayload = ActionPayload & {
  // Optional unique transaction identifier for tracking
  transactionId?: string;
  // Current synchronization status of the transaction
  transactionStatus?: 'sending' | 'failed' | 'confirmed' | 'pending';
};

/**
 * Request structure for sending board drawing actions to the server.
 * Contains all necessary information to broadcast drawing operations to other users.
 */
export interface SendBoardActionRequest {
  // ID of the board where the action is performed
  boardId: number;
  // Type of action being performed (add, update, delete)
  type: ActionType;
  // Drawing object data without instanceId (added separately)
  payload: Omit<ActionPayload, 'instanceId'>;
  // Unique identifier for this specific action instance
  instanceId: string;
  // Session ID of the user sending the action
  sender: string;
}

/**
 * Response structure for board drawing actions received from the server.
 * Represents actions performed by other users in real-time collaboration.
 */
export interface BoardActionResponse {
  // Type of action that was performed
  type: ActionType;
  // Generic payload object containing drawing data
  payload: object;
  // Session ID of the user who sent the action
  sender: string;
  // Unique identifier for this action instance
  instanceId: string;
}
