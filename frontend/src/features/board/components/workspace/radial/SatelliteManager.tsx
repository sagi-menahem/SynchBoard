import { AnimatePresence, motion, type Variants } from 'framer-motion';
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
  /** Whether toolbar is in vertical layout mode */
  isVerticalLayout?: boolean;
  /** Canvas width in pixels (for positioning) */
  canvasWidthPx?: number;
  /** Current toolbar inline style (for position reference) */
  toolbarStyle?: React.CSSProperties;
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
  isVerticalLayout = false,
  canvasWidthPx = 0,
  toolbarStyle = {},
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

  // Calculate the animation variants based on toolbar layout
  // Animation should look like satellite is emerging from the toolbar
  const getSatelliteVariants = (): Variants => {
    const springTransition = {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    };
    const exitTransition = { duration: 0.15 };

    if (isMobile) {
      // Mobile: emerge upward from bottom toolbar
      return {
        hidden: {
          opacity: 0,
          scale: 0.9,
          x: '-50%',
          y: 20, // Start below final position (closer to toolbar)
        },
        visible: {
          opacity: 1,
          scale: 1,
          x: '-50%',
          y: 0,
          transition: springTransition,
        },
        exit: {
          opacity: 0,
          scale: 0.9,
          y: 20,
          transition: exitTransition,
        },
      };
    }

    if (isVerticalLayout) {
      // Vertical toolbar: emerge horizontally from right (toward left)
      return {
        hidden: {
          opacity: 0,
          scale: 0.9,
          x: 20, // Start to the right (closer to toolbar)
          y: '50%',
        },
        visible: {
          opacity: 1,
          scale: 1,
          x: 0,
          y: '50%',
          transition: springTransition,
        },
        exit: {
          opacity: 0,
          scale: 0.9,
          x: 20,
          transition: exitTransition,
        },
      };
    }

    // Horizontal toolbar: emerge upward from bottom toolbar
    return {
      hidden: {
        opacity: 0,
        scale: 0.9,
        x: '-50%',
        y: 20, // Start below final position (closer to toolbar)
      },
      visible: {
        opacity: 1,
        scale: 1,
        x: '-50%',
        y: 0,
        transition: springTransition,
      },
      exit: {
        opacity: 0,
        scale: 0.9,
        y: 20,
        transition: exitTransition,
      },
    };
  };

  const satelliteVariants = getSatelliteVariants();

  // =========================================================================
  // RENDER SATELLITE CONTENT
  // =========================================================================

  const renderSatelliteContent = () => {
    switch (activeSatellite) {
      case 'shapes':
        return <ShapesSatellite onClose={onClose} />;

      case 'lines':
        return <LinesSatellite onClose={onClose} />;

      case 'colorPalette':
        return <ColorPaletteSatellite />;

      case 'strokeProps':
        return <StrokeWidthSatellite />;

      default:
        return null;
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  // Calculate satellite position based on device type and toolbar layout
  // NOTE: Do NOT use CSS transform here - Framer Motion handles transforms via x/y props
  const getSatelliteStyle = (): React.CSSProperties => {
    if (isMobile) {
      // Mobile: centered horizontally, above the toolbar
      // The x: '-50%' transform is applied by Framer Motion
      return {
        position: 'fixed',
        left: '50%',
        bottom: `${SATELLITE_POSITION.MOBILE_BOTTOM}px`,
      };
    }

    // Constants for toolbar dimensions
    const VERTICAL_TOOLBAR_WIDTH = 52; // 40px tool + 12px padding
    const VERTICAL_TOOLBAR_HEIGHT = 420; // 9 items × 40px + 8 gaps × 6px + 12px padding
    const GAP = 12;

    if (isVerticalLayout) {
      // Vertical toolbar: satellite appears to the left of the toolbar
      // Toolbar is positioned at bottom: 32px and extends upward
      // Center satellite vertically with the toolbar
      const toolbarRight = toolbarStyle.right;
      const rightOffset = typeof toolbarRight === 'string'
        ? parseInt(toolbarRight, 10)
        : (typeof toolbarRight === 'number' ? toolbarRight : 20);

      // Toolbar bottom edge is 32px from viewport bottom
      // Toolbar center is at: 32px + (toolbarHeight / 2) from bottom
      const TOOLBAR_BOTTOM = 32;
      const toolbarCenterFromBottom = TOOLBAR_BOTTOM + (VERTICAL_TOOLBAR_HEIGHT / 2);

      // The y: '50%' transform is applied by Framer Motion
      return {
        position: 'fixed',
        right: `${rightOffset + VERTICAL_TOOLBAR_WIDTH + GAP}px`,
        bottom: `${toolbarCenterFromBottom}px`,
      };
    }

    // Horizontal toolbar: satellite centered horizontally above the toolbar
    // The toolbar is positioned at the center of the canvas (or shifted if overlapping buttons)
    // We need to calculate the same center point the toolbar uses

    // Constants matching RadialDock.tsx
    const TOOLBAR_WIDTH = 424;
    const FLOATING_ACTIONS_WIDTH = 210;
    const RIGHT_MARGIN = 20;

    const canvasCenterPx = canvasWidthPx / 2;
    const toolbarHalfWidth = TOOLBAR_WIDTH / 2;
    const toolbarLeftIfCentered = canvasCenterPx - toolbarHalfWidth;
    const toolbarRightIfCentered = canvasCenterPx + toolbarHalfWidth;

    const availableLeft = FLOATING_ACTIONS_WIDTH;
    const availableRight = canvasWidthPx - RIGHT_MARGIN;

    // Determine toolbar center using same logic as RadialDock
    let toolbarCenterPx: number;

    if (toolbarLeftIfCentered < availableLeft || toolbarRightIfCentered > availableRight) {
      // Toolbar is shifted - centered in available space
      const availableWidth = availableRight - availableLeft;
      if (TOOLBAR_WIDTH <= availableWidth) {
        toolbarCenterPx = availableLeft + (availableWidth / 2);
      } else {
        // Toolbar positioned from right edge
        toolbarCenterPx = availableRight - (TOOLBAR_WIDTH / 2);
      }
    } else {
      // Toolbar is perfectly centered in canvas
      toolbarCenterPx = canvasCenterPx;
    }

    // The x: '-50%' transform is applied by Framer Motion
    return {
      position: 'fixed',
      left: `${toolbarCenterPx}px`,
      bottom: `${SATELLITE_POSITION.DESKTOP_BOTTOM}px`,
    };
  };

  const satelliteStyle = getSatelliteStyle();

  return (
    <AnimatePresence>
      {activeSatellite && (
        <motion.div
          className={styles.satelliteBubble}
          style={satelliteStyle}
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
