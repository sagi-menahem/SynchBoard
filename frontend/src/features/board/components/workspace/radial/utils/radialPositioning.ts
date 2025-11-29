/**
 * @fileoverview Radial positioning utilities for the RadialDock component.
 * Provides mathematical functions for calculating tool positions on a circular ring
 * and satellite bubble positioning relative to the dock.
 */

/**
 * Position of a tool on the radial ring.
 */
export interface RadialPosition {
    /** X coordinate offset from center */
    x: number;
    /** Y coordinate offset from center */
    y: number;
    /** Angle in degrees (0° = right, -90° = top) */
    angle: number;
}

/**
 * Position of a satellite bubble relative to the dock.
 */
export interface SatellitePosition {
    /** X coordinate offset from dock center */
    x: number;
    /** Y coordinate offset from dock center */
    y: number;
    /** Direction the satellite spawned */
    direction: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Calculate position for a tool on the radial ring using trigonometry.
 * 
 * The ring starts at the top (12:00 position) and tools are distributed
 * evenly around the circle. Uses standard trigonometry:
 * - x = radius * cos(angle)
 * - y = radius * sin(angle)
 * 
 * @param index - Index of the tool (0-based)
 * @param totalItems - Total number of items on the ring
 * @param radius - Radius of the ring in pixels
 * @param startAngle - Starting angle in degrees (default: -90 for top/12:00)
 * @returns Position object with x, y coordinates and angle
 * 
 * @example
 * // Position first tool at top (12:00)
 * const pos = calculateRadialPosition(0, 8, 100);
 * // Returns: { x: 0, y: -100, angle: -90 }
 */
export function calculateRadialPosition(
    index: number,
    totalItems: number,
    radius: number,
    startAngle: number = -90
): RadialPosition {
    // Calculate angle step between each tool
    const angleStep = 360 / totalItems;

    // Calculate this tool's angle
    const angle = startAngle + (index * angleStep);

    // Convert to radians for trigonometry
    const radians = (angle * Math.PI) / 180;

    // Calculate x, y using trigonometry
    // Note: y is negative for top positions due to SVG/CSS coordinate system
    return {
        x: radius * Math.cos(radians),
        y: radius * Math.sin(radians),
        angle,
    };
}

/**
 * Calculate satellite bubble position relative to the dock.
 * 
 * Chooses the direction with the most available space to prevent
 * the satellite from spawning off-screen or overlapping the dock.
 * 
 * @param dockX - X position of the dock's top-left corner
 * @param dockY - Y position of the dock's top-left corner
 * @param viewportWidth - Width of the viewport in pixels
 * @param viewportHeight - Height of the viewport in pixels
 * @param satelliteWidth - Width of the satellite bubble in pixels
 * @param satelliteHeight - Height of the satellite bubble in pixels
 * @param dockRadius - Radius of the dock ring (default: 80)
 * @param spacing - Gap between dock and satellite (default: 16)
 * @returns Position object with x, y offsets and direction
 * 
 * @example
 * // Calculate satellite position for a dock at bottom-center
 * const pos = calculateSatellitePosition(500, 700, 1920, 1080, 200, 150);
 * // Likely returns: { x: 0, y: -246, direction: 'top' }
 */
export function calculateSatellitePosition(
    dockX: number,
    dockY: number,
    viewportWidth: number,
    viewportHeight: number,
    satelliteWidth: number,
    satelliteHeight: number,
    dockRadius: number = 80,
    spacing: number = 16
): SatellitePosition {
    // Calculate dock center point
    const centerX = dockX + dockRadius;
    const centerY = dockY + dockRadius;

    // Calculate available space in each direction
    const spaces = {
        top: centerY - satelliteHeight - spacing,
        bottom: viewportHeight - centerY - satelliteHeight - spacing,
        left: centerX - satelliteWidth - spacing,
        right: viewportWidth - centerX - satelliteWidth - spacing,
    };

    // Find direction with most space
    const direction = (Object.keys(spaces) as Array<keyof typeof spaces>).reduce(
        (a, b) => (spaces[a] > spaces[b] ? a : b)
    );

    // Calculate offset from dock center for each direction
    const offsets = {
        top: { x: 0, y: -(dockRadius + satelliteHeight / 2 + spacing) },
        bottom: { x: 0, y: dockRadius + satelliteHeight / 2 + spacing },
        left: { x: -(dockRadius + satelliteWidth / 2 + spacing), y: 0 },
        right: { x: dockRadius + satelliteWidth / 2 + spacing, y: 0 },
    };

    return { ...offsets[direction], direction };
}

/**
 * Check if a point is within the viewport bounds.
 * Useful for validating satellite positions.
 * 
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param width - Width of the element
 * @param height - Height of the element
 * @param viewportWidth - Viewport width
 * @param viewportHeight - Viewport height
 * @param margin - Safety margin from edges (default: 20)
 * @returns True if the element is fully within bounds
 */
export function isWithinViewport(
    x: number,
    y: number,
    width: number,
    height: number,
    viewportWidth: number,
    viewportHeight: number,
    margin: number = 20
): boolean {
    return (
        x >= margin &&
        y >= margin &&
        x + width <= viewportWidth - margin &&
        y + height <= viewportHeight - margin
    );
}
