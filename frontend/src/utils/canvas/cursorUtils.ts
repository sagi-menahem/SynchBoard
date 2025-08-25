import type { ActionPayload, Point } from 'types/BoardObjectTypes';

import { detectObjectHit } from './hitDetection';

/**
 * Get the appropriate cursor for the recolor tool based on what's under the mouse
 */
export const getRecolorCursor = (
  mousePosition: Point,
  objects: ActionPayload[],
  canvasWidth: number,
  canvasHeight: number,
): string => {
  const hitResult = detectObjectHit(mousePosition, objects, canvasWidth, canvasHeight);
  
  if (!hitResult.hit || !hitResult.hitType) {
    return 'not-allowed'; // No object to recolor
  }
  
  switch (hitResult.hitType) {
    case 'fill':
      return 'pointer'; // Can fill the shape
    case 'stroke':
      return 'pointer'; // Can recolor the border
    case 'object':
      return 'pointer'; // Can recolor the object
    default:
      return 'not-allowed';
  }
};

/**
 * Get a tooltip description for what will happen if the user clicks
 */
export const getRecolorTooltip = (
  mousePosition: Point,
  objects: ActionPayload[],
  canvasWidth: number,
  canvasHeight: number,
): string => {
  const hitResult = detectObjectHit(mousePosition, objects, canvasWidth, canvasHeight);
  
  if (!hitResult.hit || !hitResult.object || !hitResult.hitType) {
    return 'Click on objects to recolor them';
  }
  
  const { object, hitType } = hitResult;
  const toolName = object.tool.charAt(0).toUpperCase() + object.tool.slice(1);
  
  switch (hitType) {
    case 'fill':
      return `Click to fill ${toolName.toLowerCase()}`;
    case 'stroke':
      return `Click to recolor ${toolName.toLowerCase()} border`;
    case 'object':
      return `Click to recolor ${toolName.toLowerCase()}`;
    default:
      return 'Click on objects to recolor them';
  }
};