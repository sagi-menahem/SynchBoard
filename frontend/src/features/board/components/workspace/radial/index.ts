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

export { RadialDock } from './RadialDock';
export { SatelliteManager } from './SatelliteManager';

// Utilities
export {
    calculateSatellitePosition,
    isWithinViewport
} from './utils/radialPositioning';

export type {
    SatellitePosition
} from './utils/radialPositioning';

