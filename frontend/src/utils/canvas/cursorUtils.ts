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

