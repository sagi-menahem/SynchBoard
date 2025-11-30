import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import styles from './RadialDock.module.scss';

/**
 * Props for the SatelliteManager component.
 */
interface SatelliteManagerProps {
    /** Currently active satellite type (null if none) */
    activeSatellite: string | null;
    /** Handler to close the satellite */
    onClose: () => void;
}

/**
 * SatelliteManager component - Coordinates satellite sub-menus.
 * 
 * Fixed Bottom Toolbar Version:
 * - Satellites ALWAYS open upward from the bottom toolbar
 * - Simplified positioning logic (no complex calculations needed)
 * - Mobile and desktop use same vertical direction
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
 * @param dockPosition - Current dock CSS position name
 * @param onClose - Handler to close the satellite
 */
export const SatelliteManager: React.FC<SatelliteManagerProps> = ({
    activeSatellite,
    onClose,
}) => {
    const [satellitePos, setSatellitePos] = useState({ x: 0, y: 0 });

    // =========================================================================
    // POSITION CALCULATION - Simplified for Fixed Bottom Toolbar
    // =========================================================================

    useEffect(() => {
        if (!activeSatellite) return;

        const calculatePosition = () => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            
            // Position satellite above the bottom toolbar
            // Centered horizontally, fixed distance from bottom
            const x = vw / 2;
            const y = vh - 100; // 100px from bottom (above toolbar)

            setSatellitePos({ x, y });
        };

        calculatePosition();

        // Recalculate on viewport resize
        window.addEventListener('resize', calculatePosition);
        return () => window.removeEventListener('resize', calculatePosition);
    }, [activeSatellite]);

    // =========================================================================
    // CLICK OUTSIDE HANDLER
    // =========================================================================

    useEffect(() => {
        if (!activeSatellite) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // Don't close if clicking inside the satellite or the toolbar
            if (
                target.closest(`.${styles.satelliteBubble}`) ||
                target.closest(`.${styles.fixedToolbar}`)
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
