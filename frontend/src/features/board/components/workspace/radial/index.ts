/**
 * @fileoverview Radial Dock - Circular menu system for drawing tools.
 * 
 * Phase 1 (Foundation - Week 1):
 * - Core component structure
 * - Radial positioning utilities
 * - Expansion/collapse animation
 * - Glass morphism styling
 * 
 * Future Phases:
 * - Phase 2: Full tool integration
 * - Phase 3: Satellite sub-menus
 * - Phase 4: Drag behavior & mobile optimization
 */

export { CentralTrigger } from './CentralTrigger';
export { RadialDock } from './RadialDock';
export { RadialRing } from './RadialRing';
export { SatelliteManager } from './SatelliteManager';
export { ToolButton } from './ToolButton';

// Utilities
export {
    calculateRadialPosition,
    calculateSatellitePosition,
    isWithinViewport
} from './utils/radialPositioning';

export type {
    RadialPosition,
    SatellitePosition
} from './utils/radialPositioning';

