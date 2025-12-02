import type { ActionPayload, Point } from 'features/board/types/BoardObjectTypes';

import { detectObjectHit } from './hitDetection';

/**
 * Determines the appropriate cursor style for the recolor tool based on object hit detection.
 * Analyzes the mouse position against canvas objects to determine if recoloring is possible
 * at the current location. Returns visual feedback cursors to guide user interaction with
 * the recolor tool, distinguishing between valid targets and invalid areas.
 *
 * @param mousePosition - Current mouse coordinates on the canvas
 * @param objects - Array of canvas objects to test for hit detection
 * @param canvasWidth - Canvas width in pixels for coordinate scaling
 * @param canvasHeight - Canvas height in pixels for coordinate scaling
 * @returns CSS cursor style string indicating recolor availability ('pointer' or 'not-allowed')
 */
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
