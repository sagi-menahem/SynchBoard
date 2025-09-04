import type {
  ActionPayload,
  CirclePayload,
  Point,
  PolygonPayload,
  RectanglePayload,
  SendBoardActionRequest,
  TrianglePayload,
} from 'features/board/types/BoardObjectTypes';

import { detectObjectHit, type HitResult } from './hitDetection';

export interface RecolorAction {
  shouldPerformAction: boolean;
  action?: Omit<SendBoardActionRequest, 'boardId'>;
  reason?: string;
}

/**
 * Processes a recolor tool click and determines the appropriate action to perform.
 * Uses hit detection to identify the clicked object and determines whether to recolor
 * the fill, stroke, or entire object based on the hit type. Returns a structured
 * action object that can be executed or rejected based on the hit results.
 * 
 * @param clickPoint - Mouse click coordinates in pixels
 * @param objects - Array of canvas objects to test for hit detection
 * @param canvasWidth - Canvas width in pixels for coordinate conversion
 * @param canvasHeight - Canvas height in pixels for coordinate conversion
 * @param newColor - Color to apply to the hit object
 * @param instanceId - Current user's instance ID for action attribution
 * @returns Recolor action with execution flag and optional board update action
 */
export const processRecolorClick = (
  clickPoint: Point,
  objects: ActionPayload[],
  canvasWidth: number,
  canvasHeight: number,
  newColor: string,
  instanceId: string,
): RecolorAction => {
  const hitResult: HitResult = detectObjectHit(clickPoint, objects, canvasWidth, canvasHeight);

  if (hitResult.hit !== true || !hitResult.object || !hitResult.hitType) {
    return {
      shouldPerformAction: false,
      reason: 'No object hit - clicking on empty area',
    };
  }

  const { object, hitType } = hitResult;

  if (hitType === 'fill') {
    return createFillColorAction(object, newColor, instanceId);
  } else if (hitType === 'stroke') {
    return createStrokeColorAction(object, newColor, instanceId);
  } else if (hitType === 'object') {
    return createObjectColorAction(object, newColor, instanceId);
  }

  return {
    shouldPerformAction: false,
    reason: `Unknown hit type: ${hitType}`,
  };
};

const createFillColorAction = (
  object: ActionPayload,
  newColor: string,
  instanceId: string,
): RecolorAction => {
  const updatedPayload = { ...object };

  if (object.tool === 'square' || object.tool === 'rectangle') {
    (updatedPayload as RectanglePayload).fillColor = newColor;
  } else if (object.tool === 'circle') {
    (updatedPayload as CirclePayload).fillColor = newColor;
  } else if (object.tool === 'triangle') {
    (updatedPayload as TrianglePayload).fillColor = newColor;
  } else if (object.tool === 'pentagon' || object.tool === 'hexagon' || object.tool === 'star') {
    (updatedPayload as PolygonPayload).fillColor = newColor;
  } else {
    return {
      shouldPerformAction: false,
      reason: `Cannot set fill color on object type: ${object.tool}`,
    };
  }

  return {
    shouldPerformAction: true,
    action: {
      type: 'OBJECT_UPDATE',
      payload: updatedPayload as Omit<ActionPayload, 'instanceId'>,
      sender: instanceId,
      instanceId: object.instanceId,
    },
    reason: `Setting fill color to ${newColor} on ${object.tool}`,
  };
};

const createStrokeColorAction = (
  object: ActionPayload,
  newColor: string,
  instanceId: string,
): RecolorAction => {
  const updatedPayload = { ...object };
  (updatedPayload as ActionPayload & { color: string }).color = newColor;

  return {
    shouldPerformAction: true,
    action: {
      type: 'OBJECT_UPDATE',
      payload: updatedPayload as Omit<ActionPayload, 'instanceId'>,
      sender: instanceId,
      instanceId: object.instanceId,
    },
    reason: `Setting stroke color to ${newColor} on ${object.tool}`,
  };
};

const createObjectColorAction = (
  object: ActionPayload,
  newColor: string,
  instanceId: string,
): RecolorAction => {
  const updatedPayload = { ...object };
  (updatedPayload as ActionPayload & { color: string }).color = newColor;

  return {
    shouldPerformAction: true,
    action: {
      type: 'OBJECT_UPDATE',
      payload: updatedPayload as Omit<ActionPayload, 'instanceId'>,
      sender: instanceId,
      instanceId: object.instanceId,
    },
    reason: `Recoloring ${object.tool} to ${newColor}`,
  };
};

/**
 * Generates a user-friendly description of what will be recolored at the given point.
 * Uses hit detection to identify the object and hit type, then creates descriptive
 * text for UI tooltips and feedback. Distinguishes between fill recoloring, stroke
 * recoloring, and general object recoloring based on the hit detection results.
 * 
 * @param clickPoint - Mouse position coordinates in pixels
 * @param objects - Array of canvas objects to test for hit detection
 * @param canvasWidth - Canvas width in pixels for coordinate conversion
 * @param canvasHeight - Canvas height in pixels for coordinate conversion
 * @returns Human-readable description of the recolor operation
 */
export const getRecolorDescription = (
  clickPoint: Point,
  objects: ActionPayload[],
  canvasWidth: number,
  canvasHeight: number,
): string => {
  const hitResult = detectObjectHit(clickPoint, objects, canvasWidth, canvasHeight);

  if (hitResult.hit !== true || !hitResult.object || !hitResult.hitType) {
    return 'No object to recolor';
  }

  const { object, hitType } = hitResult;
  const toolName = object.tool.charAt(0).toUpperCase() + object.tool.slice(1);

  if (hitType === 'fill') {
    return `Fill ${toolName.toLowerCase()}`;
  } else if (hitType === 'stroke') {
    return `Recolor ${toolName.toLowerCase()} border`;
  } else {
    return `Recolor ${toolName.toLowerCase()}`;
  }
};
