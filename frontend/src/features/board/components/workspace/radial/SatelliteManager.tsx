import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import styles from './RadialDock.module.scss';
import {
  ColorPaletteSatellite,
  LinesSatellite,
  ShapesSatellite,
  StrokeWidthSatellite,
} from './satellites';

/**
 * Props for the SatelliteManager component.
 */
interface SatelliteManagerProps {
  /** Currently active satellite type (null if none) */
  activeSatellite: string | null;
  /** Handler to close the satellite */
  onClose: () => void;
  /** Whether device is mobile */
  isMobile: boolean;
  /** Handler to collapse the toolbar (mobile only) */
  onCollapse: () => void;
}

// Satellite positioning constants
const SATELLITE_POSITION = {
  // Desktop: toolbar at bottom: 32px, height: ~56px, gap: 8px
  DESKTOP_BOTTOM: 96,
  // Mobile: tab (48px) + toolbar content (120px) + gap (16px) = 184px
  MOBILE_BOTTOM: 184,
};

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
  isMobile: isMobileProp,
  onCollapse,
}) => {
  const [isMobile, setIsMobile] = useState(isMobileProp);

  // =========================================================================
  // MOBILE DETECTION
  // =========================================================================

  useEffect(() => {
    setIsMobile(isMobileProp);
  }, [isMobileProp]);

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
        return <ShapesSatellite onClose={onClose} isMobile={isMobile} onCollapse={onCollapse} />;

      case 'lines':
        return <LinesSatellite onClose={onClose} isMobile={isMobile} onCollapse={onCollapse} />;

      case 'colorPalette':
        return <ColorPaletteSatellite isMobile={isMobile} onCollapse={onCollapse} />;

      case 'strokeProps':
        return <StrokeWidthSatellite />;

      default:
        return null;
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  // Calculate bottom position based on device type
  const bottomPosition = isMobile
    ? SATELLITE_POSITION.MOBILE_BOTTOM
    : SATELLITE_POSITION.DESKTOP_BOTTOM;

  return (
    <AnimatePresence>
      {activeSatellite && (
        <motion.div
          className={styles.satelliteBubble}
          style={{
            position: 'fixed',
            left: '50%',
            bottom: `${bottomPosition}px`,
            x: '-50%', // Framer Motion transform - avoids CSS conflicts
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
