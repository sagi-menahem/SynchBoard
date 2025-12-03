/**
 * @fileoverview Radial dock utilities barrel export.
 * Exports mobile detection and tool icon utility functions.
 */

export { detectMobileDevice } from './MobileDetection';
export {
  checkIsToolActive,
  createToolIcon,
  getActiveToolIcon,
  getLineIcon,
  getShapeIcon,
  isSatelliteActive,
} from './ToolIconUtils';
