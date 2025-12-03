/**
 * @fileoverview Radial Dock - Toolbar system for drawing tools.
 *
 * Architecture:
 * - RadialDock: Main orchestrator component
 * - MobileToolbar/DesktopToolbar: Platform-specific rendering
 * - SatelliteManager: Sub-menu coordination (shapes, lines, colors, stroke)
 * - Hooks: State management, positioning, and drag gestures
 * - Utils: Mobile detection, icon utilities
 * - Constants: Layout constants, tool configuration
 */

// Main components
export { RadialDock } from './RadialDock';
export { SatelliteManager } from './SatelliteManager';

// Sub-components
export { DesktopToolbar, MobileToolbar } from './components';

// Hooks
export { useMobileDragGesture, useRadialDockState, useToolbarPosition } from './hooks';

// Utilities
export { calculateSatellitePosition, isWithinViewport } from './utils/radialPositioning';
export {
  checkIsToolActive,
  createToolIcon,
  detectMobileDevice,
  getActiveToolIcon,
  getLineIcon,
  getShapeIcon,
  isSatelliteActive,
} from './utils';

// Constants
export {
  DOCK_TOOLS,
  DRAG_OPEN_THRESHOLD,
  LINE_TOOLS,
  SHAPE_TOOLS,
  TOOLBAR_HEIGHT_MOBILE,
  TOOLBAR_WIDTH,
} from './constants';

// Types
export type {
  DesktopToolbarProps,
  MobileDragHandlers,
  MobileToolbarProps,
  RadialDockActions,
  RadialDockProps,
  RadialDockState,
  ToolItem,
} from './types';
export type { SatellitePosition } from './utils/radialPositioning';
