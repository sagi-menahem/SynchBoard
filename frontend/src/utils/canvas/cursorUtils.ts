import type { ActionPayload, Point } from 'types/BoardObjectTypes';

import { detectObjectHit } from './hitDetection';

export const getRecolorCursor = (
  mousePosition: Point,
  objects: ActionPayload[],
  canvasWidth: number,
  canvasHeight: number,
): string => {
  const hitResult = detectObjectHit(mousePosition, objects, canvasWidth, canvasHeight);

  if (!hitResult.hit || !hitResult.hitType) {
    return 'not-allowed';
  }

  switch (hitResult.hitType) {
    case 'fill':
      return 'pointer';
    case 'stroke':
      return 'pointer';
    case 'object':
      return 'pointer';
    default:
      return 'not-allowed';
  }
};

