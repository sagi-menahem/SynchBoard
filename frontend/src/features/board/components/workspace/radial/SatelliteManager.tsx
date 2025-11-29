import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { calculateSatellitePosition } from './utils/radialPositioning';

import styles from './RadialDock.module.scss';

/**
 * Props for the SatelliteManager component.
 */
interface SatelliteManagerProps {
    /** Currently active satellite type (null if none) */
    activeSatellite: string | null;
    /** Current dock position (center coordinates) */
    dockPosition: { x: number; y: number };
    /** Handler to close the satellite */
    onClose: () => void;
}

/**
 * SatelliteManager component - Coordinates satellite sub-menus.
 * 
 * Responsibilities:
 * - Calculate smart positioning for satellites based on available screen space
 * - Render the active satellite with proper placement
 * - Handle click-outside to close
 * - Prevent satellites from spawning off-screen
 * 
 * Smart Positioning Logic:
 * - If dock is at bottom → Spawn satellite above
 * - If dock is at top → Spawn satellite below
 * - If dock is at left → Spawn satellite right
 * - If dock is at right → Spawn satellite left
 * 
 * Phase 2 Implementation:
 * - Empty placeholder bubbles (content in Phase 3)
 * - Proper positioning algorithm
 * - Click-outside handling
 * 
 * @param activeSatellite - Type of satellite to show ('shapes', 'lines', 'colorPalette', 'strokeProps')
 * @param dockPosition - Current dock center position
 * @param onClose - Handler to close the satellite
 */
export const SatelliteManager: React.FC<SatelliteManagerProps> = ({
    activeSatellite,
    dockPosition,
    onClose,
}) => {
    const [satellitePos, setSatellitePos] = useState<{
        x: number;
        y: number;
        direction: 'top' | 'bottom' | 'left' | 'right';
    }>({ x: 0, y: 0, direction: 'top' });

    // =========================================================================
    // POSITION CALCULATION
    // =========================================================================

    useEffect(() => {
        if (!activeSatellite) return;

        const calculatePosition = () => {
            // Estimated satellite dimensions (will be refined in Phase 3)
            const satelliteWidth = 200;
            const satelliteHeight = 150;

            const position = calculateSatellitePosition(
                dockPosition.x,
                dockPosition.y,
                window.innerWidth,
                window.innerHeight,
                satelliteWidth,
                satelliteHeight,
            );

            setSatellitePos(position);
        };

        calculatePosition();

        // Recalculate on viewport resize
        window.addEventListener('resize', calculatePosition);
        return () => window.removeEventListener('resize', calculatePosition);
    }, [activeSatellite, dockPosition]);

    // =========================================================================
    // CLICK OUTSIDE HANDLER
    // =========================================================================

    useEffect(() => {
        if (!activeSatellite) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // Don't close if clicking inside the satellite or the dock
            if (
                target.closest(`.${styles.satelliteBubble}`) ||
                target.closest(`.${styles.dockWrapper}`)
            ) {
                return;
            }

            onClose();
        };

        // Add slight delay to prevent immediate closure on open
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeSatellite, onClose]);

    // =========================================================================
    // ANIMATION VARIANTS
    // =========================================================================

    const satelliteVariants = {
        hidden: { opacity: 0, scale: 0.8, y: -10 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 0.2 },
        },
    };

    // =========================================================================
    // RENDER SATELLITE CONTENT
    // =========================================================================

    const renderSatelliteContent = () => {
        switch (activeSatellite) {
            case 'shapes':
                return (
                    <div className={styles.satelliteContent}>
                        <div className={styles.satelliteHeader}>Shapes</div>
                        <div className={styles.satellitePlaceholder}>
                            Shape Selector (Phase 3)
                        </div>
                    </div>
                );

            case 'lines':
                return (
                    <div className={styles.satelliteContent}>
                        <div className={styles.satelliteHeader}>Lines</div>
                        <div className={styles.satellitePlaceholder}>
                            Line Selector (Phase 3)
                        </div>
                    </div>
                );

            case 'colorPalette':
                return (
                    <div className={styles.satelliteContent}>
                        <div className={styles.satelliteHeader}>Colors</div>
                        <div className={styles.satellitePlaceholder}>
                            Color Palette (Phase 3)
                        </div>
                    </div>
                );

            case 'strokeProps':
                return (
                    <div className={styles.satelliteContent}>
                        <div className={styles.satelliteHeader}>Stroke Width</div>
                        <div className={styles.satellitePlaceholder}>
                            Stroke Slider (Phase 3)
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // =========================================================================
    // RENDER
    // =========================================================================

    return (
        <AnimatePresence>
            {activeSatellite && (
                <motion.div
                    className={styles.satelliteBubble}
                    style={{
                        position: 'absolute',
                        left: `${satellitePos.x}px`,
                        top: `${satellitePos.y}px`,
                        transform: 'translate(-50%, -50%)',
                    }}
                    variants={satelliteVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                >
                    {renderSatelliteContent()}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
