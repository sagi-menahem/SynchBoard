import { TOOLS } from 'features/board/constants/BoardConstants';
import { useToolPreferences } from 'features/settings/ToolPreferencesProvider';
import type { DockAnchor } from 'features/settings/types/UserTypes';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  type PanInfo,
} from 'framer-motion';
import { Brush, ChevronDown, ChevronUp, Eraser, GripVertical, Pipette, Type } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Tool } from 'shared/types/CommonTypes';
import { ColorPicker, Slider, ToolButton } from 'shared/ui';
import { isRTL } from 'shared/utils/rtlUtils';

import { LineToolsDropdown } from './LineToolsDropdown';
import { ShapeToolsDropdown } from './ShapeToolsDropdown';

import styles from './FloatingDock.module.scss';

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Margin from viewport edges in pixels.
 * This creates a buffer zone so the dock never touches the screen edge.
 */
const EDGE_MARGIN = 20;

/**
 * Mobile breakpoint width in pixels.
 * Below this width, the dock is locked to bottom-center and drag is disabled.
 */
const MOBILE_BREAKPOINT = 768;

/**
 * Minimum drag distance (px) to differentiate drag from click.
 * Prevents accidental expansion when user clicks the minimized dock.
 */
const DRAG_THRESHOLD = 5;

/**
 * Header height offset for top anchors.
 * Ensures dock doesn't overlap with the AppHeader.
 */
const HEADER_HEIGHT = 56;

/**
 * Default dock dimensions used before actual measurement.
 * These are conservative estimates to prevent initial positioning errors.
 */
const DEFAULT_DOCK_SIZE = { width: 500, height: 56 };

/**
 * Spring animation configuration for snapping.
 * Tuned for a slow, highly visible animation (~500ms feel).
 * Creates a sense of the dock being "pulled" into place.
 * - stiffness: 120 = soft, slow movement
 * - damping: 22 = minimal wobble, smooth settle
 * - mass: 1 = natural weight/inertia
 */
const SNAP_SPRING = {
  type: 'spring' as const,
  stiffness: 120,
  damping: 22,
  mass: 1,
};

// =============================================================================
// TYPES
// =============================================================================

/**
 * Allowed dock anchors - 5 positions, dynamically excluding one based on RTL/LTR.
 * The excluded position is where FloatingActions is located.
 */
type AllowedDockAnchor =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

// =============================================================================
// HELPER FUNCTIONS (Pure, no side effects)
// =============================================================================

/**
 * Get allowed anchors based on language direction.
 * - LTR: Exclude bottom-left (FloatingActions is there)
 * - RTL: Exclude bottom-right (FloatingActions is there)
 */
const getAllowedAnchors = (isRTLMode: boolean): AllowedDockAnchor[] => {
  if (isRTLMode) {
    return ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center'];
  }
  return ['top-left', 'top-center', 'top-right', 'bottom-center', 'bottom-right'];
};

/**
 * Calculate pixel position for an anchor.
 * All calculations use fresh viewport/dock dimensions passed as parameters.
 */
const getAnchorPosition = (
  anchor: AllowedDockAnchor,
  viewportWidth: number,
  viewportHeight: number,
  dockWidth: number,
  dockHeight: number,
): { x: number; y: number } => {
  const positions: Record<AllowedDockAnchor, { x: number; y: number }> = {
    'top-left': {
      x: EDGE_MARGIN,
      y: EDGE_MARGIN + HEADER_HEIGHT,
    },
    'top-center': {
      x: Math.max(EDGE_MARGIN, (viewportWidth - dockWidth) / 2),
      y: EDGE_MARGIN + HEADER_HEIGHT,
    },
    'top-right': {
      x: Math.max(EDGE_MARGIN, viewportWidth - dockWidth - EDGE_MARGIN),
      y: EDGE_MARGIN + HEADER_HEIGHT,
    },
    'bottom-left': {
      x: EDGE_MARGIN,
      y: Math.max(EDGE_MARGIN + HEADER_HEIGHT, viewportHeight - dockHeight - EDGE_MARGIN),
    },
    'bottom-center': {
      x: Math.max(EDGE_MARGIN, (viewportWidth - dockWidth) / 2),
      y: Math.max(EDGE_MARGIN + HEADER_HEIGHT, viewportHeight - dockHeight - EDGE_MARGIN),
    },
    'bottom-right': {
      x: Math.max(EDGE_MARGIN, viewportWidth - dockWidth - EDGE_MARGIN),
      y: Math.max(EDGE_MARGIN + HEADER_HEIGHT, viewportHeight - dockHeight - EDGE_MARGIN),
    },
  };

  return positions[anchor] || positions['bottom-center'];
};

/**
 * Map any anchor to a valid allowed anchor based on RTL mode.
 * Handles legacy anchors and forbidden positions.
 */
const mapToAllowedAnchor = (
  anchor: DockAnchor | undefined,
  isRTLMode: boolean,
): AllowedDockAnchor => {
  const allowedAnchors = getAllowedAnchors(isRTLMode);
  const defaultAnchor: AllowedDockAnchor = 'bottom-center';

  if (!anchor) return defaultAnchor;

  if (allowedAnchors.includes(anchor as AllowedDockAnchor)) {
    return anchor as AllowedDockAnchor;
  }

  // Map forbidden anchors to nearest allowed
  if (isRTLMode && anchor === 'bottom-right') return 'bottom-center';
  if (!isRTLMode && anchor === 'bottom-left') return 'bottom-center';

  // Map legacy side anchors
  if (anchor === 'left-center') return 'bottom-left';
  if (anchor === 'right-center') return 'bottom-right';

  return defaultAnchor;
};

/**
 * Calculate explicit drag constraints from fresh viewport dimensions.
 * CRITICAL: Always use fresh measurements to prevent stale constraint bugs.
 */
const calculateConstraints = (
  viewportWidth: number,
  viewportHeight: number,
  dockWidth: number,
  dockHeight: number,
) => ({
  left: EDGE_MARGIN,
  right: Math.max(EDGE_MARGIN, viewportWidth - dockWidth - EDGE_MARGIN),
  top: EDGE_MARGIN + HEADER_HEIGHT,
  bottom: Math.max(EDGE_MARGIN + HEADER_HEIGHT, viewportHeight - dockHeight - EDGE_MARGIN),
});

/**
 * Find the nearest anchor using Euclidean distance.
 * "Winner Takes All" - always returns the closest anchor, no exceptions.
 */
const findNearestAnchor = (
  x: number,
  y: number,
  viewportWidth: number,
  viewportHeight: number,
  dockWidth: number,
  dockHeight: number,
  allowedAnchors: AllowedDockAnchor[],
): AllowedDockAnchor => {
  let nearestAnchor: AllowedDockAnchor = 'bottom-center';
  let minDistance = Infinity;

  for (const anchor of allowedAnchors) {
    const anchorPos = getAnchorPosition(anchor, viewportWidth, viewportHeight, dockWidth, dockHeight);
    const distance = Math.hypot(x - anchorPos.x, y - anchorPos.y);

    if (distance < minDistance) {
      minDistance = distance;
      nearestAnchor = anchor;
    }
  }

  return nearestAnchor;
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * FloatingDock component - Production-stable draggable toolbar.
 *
 * ARCHITECTURE:
 * - Uses `useMotionValue` for x/y coordinates to decouple drag from React state
 * - Uses `useAnimationControls` for programmatic snap animations
 * - All constraint calculations use fresh viewport measurements
 * - "Winner Takes All" snapping ensures dock NEVER floats in no-man's land
 *
 * STABILITY FEATURES:
 * - Motion values operate outside React's update cycle for smooth 60fps drag
 * - Fresh measurements taken at drag-end for accurate snapping
 * - ResizeObserver for reliable viewport tracking
 * - Explicit pixel constraints (not ref-based) prevent stale data bugs
 */
export const FloatingDock: React.FC = () => {
  const { t, i18n } = useTranslation(['board', 'common']);
  const {
    preferences,
    updateTool,
    updateStrokeColor,
    updateStrokeWidth,
    updateDockAnchor,
    updateDockMinimized,
  } = useToolPreferences();

  // =========================================================================
  // REFS
  // =========================================================================

  const dockRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const hasDragged = useRef(false);

  // Store current dock size in ref for instant access during drag
  // This avoids stale closure issues in event handlers
  const dockSizeRef = useRef(DEFAULT_DOCK_SIZE);

  // =========================================================================
  // MOTION VALUES (Direct control for smooth drag + snap)
  // =========================================================================

  /**
   * Motion values for x/y coordinates.
   * Using motion values with the `animate()` function (not `animate` prop)
   * gives us direct control over animations without conflicts with drag.
   *
   * KEY INSIGHT: The `animate()` function from framer-motion animates motion
   * values directly, separate from the component's animate prop. This allows
   * drag to work smoothly (updating motion values) and then we can animate
   * those same values to snap positions after drag ends.
   */
  const motionX = useMotionValue(0);
  const motionY = useMotionValue(0);

  // =========================================================================
  // STATE
  // =========================================================================

  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(preferences.isDockMinimized || false);

  // Track dock size in state for constraint reactivity
  const [dockSize, setDockSize] = useState(DEFAULT_DOCK_SIZE);

  // Track viewport size for constraint calculations
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // =========================================================================
  // DERIVED VALUES
  // =========================================================================

  const isRTLMode = useMemo(() => isRTL(i18n.language), [i18n.language]);
  const allowedAnchors = useMemo(() => getAllowedAnchors(isRTLMode), [isRTLMode]);

  const [currentAnchor, setCurrentAnchor] = useState<AllowedDockAnchor>(() =>
    mapToAllowedAnchor(preferences.dockAnchor, isRTL(i18n.language)),
  );

  // =========================================================================
  // CONSTRAINT CALCULATION (Always fresh)
  // =========================================================================

  /**
   * Explicit drag constraints calculated from current viewport and dock size.
   * Memoized but dependencies ensure it updates when dimensions change.
   */
  const dragConstraints = useMemo(
    () => calculateConstraints(viewportSize.width, viewportSize.height, dockSize.width, dockSize.height),
    [viewportSize, dockSize],
  );

  // =========================================================================
  // SNAP TO ANCHOR (Core positioning logic)
  // =========================================================================

  /**
   * Move dock to a specific anchor position.
   * Uses the `animate()` function to directly animate motion values.
   *
   * @param anchor - Target anchor position
   * @param shouldAnimate - If true, use spring animation; if false, jump instantly
   */
  const snapToAnchor = useCallback(
    (anchor: AllowedDockAnchor, shouldAnimate = true) => {
      // Get fresh viewport dimensions
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const dw = dockSizeRef.current.width;
      const dh = dockSizeRef.current.height;

      const targetPos = getAnchorPosition(anchor, vw, vh, dw, dh);

      if (shouldAnimate) {
        // Use the `animate()` function to animate motion values directly
        // This is the KEY to consistent spring animations - it bypasses
        // any conflicts with the component's animate prop
        void animate(motionX, targetPos.x, SNAP_SPRING);
        void animate(motionY, targetPos.y, SNAP_SPRING);
      } else {
        // Instant jump (used for initial positioning)
        motionX.set(targetPos.x);
        motionY.set(targetPos.y);
      }
    },
    [motionX, motionY],
  );

  // =========================================================================
  // INITIALIZATION & SYNC
  // =========================================================================

  /**
   * Initialize position on mount and when anchor changes.
   */
  useEffect(() => {
    const anchor = mapToAllowedAnchor(preferences.dockAnchor, isRTLMode);
    setCurrentAnchor(anchor);
    void snapToAnchor(anchor, false);
  }, [preferences.dockAnchor, isRTLMode, snapToAnchor]);

  /**
   * Sync minimized state with preferences.
   */
  useEffect(() => {
    setIsMinimized(preferences.isDockMinimized || false);
  }, [preferences.isDockMinimized]);

  // =========================================================================
  // VIEWPORT RESIZE HANDLING
  // =========================================================================

  /**
   * Handle viewport resize using ResizeObserver for reliability.
   * Updates viewport size state and re-positions dock to current anchor.
   */
  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleResize = () => {
      // Debounce resize events to prevent excessive updates
      if (resizeTimeout) clearTimeout(resizeTimeout);

      resizeTimeout = setTimeout(() => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        const mobile = newWidth < MOBILE_BREAKPOINT;

        setViewportSize({ width: newWidth, height: newHeight });
        setIsMobile(mobile);

        // Re-snap to current anchor with new dimensions
        const effectiveAnchor = mobile ? 'bottom-center' : currentAnchor;
        void snapToAnchor(effectiveAnchor, true);
      }, 100);
    };

    // Initial setup
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, [currentAnchor, snapToAnchor]);

  // =========================================================================
  // DOCK SIZE MEASUREMENT
  // =========================================================================

  /**
   * Measure dock size after render and update position.
   * Uses ResizeObserver for reliable size tracking.
   */
  useEffect(() => {
    if (!dockRef.current) return;

    const measureAndUpdate = () => {
      if (!dockRef.current) return;

      const rect = dockRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const newSize = { width: rect.width, height: rect.height };

        // Check if size actually changed
        if (dockSizeRef.current.width !== newSize.width || dockSizeRef.current.height !== newSize.height) {
          dockSizeRef.current = newSize;
          setDockSize(newSize);

          // Re-snap to anchor with new size
          const effectiveAnchor = isMobile ? 'bottom-center' : currentAnchor;
          void snapToAnchor(effectiveAnchor, true);
        }
      }
    };

    // Use ResizeObserver for reliable size tracking
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(measureAndUpdate);
    });

    resizeObserver.observe(dockRef.current);

    // Initial measurement
    requestAnimationFrame(measureAndUpdate);

    return () => resizeObserver.disconnect();
  }, [isMinimized, currentAnchor, isMobile, snapToAnchor]);

  // =========================================================================
  // RTL MODE CHANGE HANDLING
  // =========================================================================

  /**
   * Re-validate anchor when RTL mode changes.
   */
  useEffect(() => {
    const validAnchor = mapToAllowedAnchor(currentAnchor, isRTLMode);
    if (validAnchor !== currentAnchor) {
      setCurrentAnchor(validAnchor);
      void snapToAnchor(validAnchor, true);
      void updateDockAnchor(validAnchor as DockAnchor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRTLMode]);

  // =========================================================================
  // DRAG HANDLERS
  // =========================================================================

  /**
   * Handle drag start - record starting position for click detection.
   */
  const handleDragStart = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(true);
      hasDragged.current = false;
      dragStartPos.current = { x: info.point.x, y: info.point.y };
    },
    [],
  );

  /**
   * Handle drag - check if we've moved enough to count as a drag.
   */
  const handleDrag = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (dragStartPos.current) {
        const deltaX = Math.abs(info.point.x - dragStartPos.current.x);
        const deltaY = Math.abs(info.point.y - dragStartPos.current.y);
        if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
          hasDragged.current = true;
        }
      }
    },
    [],
  );

  /**
   * Handle drag end - MANDATORY SNAPPING to nearest anchor.
   *
   * CRITICAL: This reads the current position from motion values (not state)
   * and uses the `animate()` function for consistent spring animation.
   */
  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, _info: PanInfo) => {
      setIsDragging(false);
      dragStartPos.current = null;

      if (isMobile) return;

      // Read current position from motion values - this is where the drag left us
      const currentX = motionX.get();
      const currentY = motionY.get();

      // Get FRESH viewport dimensions at this exact moment
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const dw = dockSizeRef.current.width;
      const dh = dockSizeRef.current.height;

      // WINNER TAKES ALL: Find nearest anchor using Euclidean distance
      const nearestAnchor = findNearestAnchor(currentX, currentY, vw, vh, dw, dh, allowedAnchors);

      // FORCE SNAP - animate to anchor position, no exceptions
      setCurrentAnchor(nearestAnchor);

      // Calculate snap position
      const snapPos = getAnchorPosition(nearestAnchor, vw, vh, dw, dh);

      // Use `animate()` function to animate motion values with spring
      // This is the CRITICAL fix - animate() works consistently every time
      // regardless of drag state or previous animations
      void animate(motionX, snapPos.x, SNAP_SPRING);
      void animate(motionY, snapPos.y, SNAP_SPRING);

      // Persist to backend
      void updateDockAnchor(nearestAnchor as DockAnchor);
    },
    [isMobile, motionX, motionY, allowedAnchors, updateDockAnchor],
  );

  // =========================================================================
  // MINIMIZE TOGGLE
  // =========================================================================

  /**
   * Toggle minimized state - only if not dragging.
   */
  const handleToggleMinimize = useCallback(() => {
    if (hasDragged.current) {
      hasDragged.current = false;
      return;
    }

    const newMinimized = !isMinimized;
    setIsMinimized(newMinimized);
    void updateDockMinimized(newMinimized);
  }, [isMinimized, updateDockMinimized]);

  // =========================================================================
  // TOOL HANDLERS
  // =========================================================================

  const handleToolSelect = useCallback(
    (tool: Tool) => {
      void updateTool(tool);
    },
    [updateTool],
  );

  const handleColorChange = useCallback(
    (color: string) => {
      void updateStrokeColor(color);
    },
    [updateStrokeColor],
  );

  const handleStrokeWidthChange = useCallback(
    (value: number) => {
      void updateStrokeWidth(value);
    },
    [updateStrokeWidth],
  );

  const currentTool = preferences.defaultTool;

  // =========================================================================
  // ANIMATION VARIANTS
  // =========================================================================

  const toolsVariants = {
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.02 },
    },
    hidden: {
      opacity: 0,
    },
  };

  const toolItemVariants = {
    visible: { opacity: 1, scale: 1 },
    hidden: { opacity: 0, scale: 0.9 },
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <motion.div
      ref={dockRef}
      className={`${styles.dock} ${isDragging ? styles.dragging : ''}`}
      // Drag configuration
      drag={!isMobile}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={dragConstraints}
      // Event handlers
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      // Use style prop with motion values for position
      // This allows drag to update motion values directly,
      // and we use animate() function to spring-animate them after drag
      style={{ x: motionX, y: motionY }}
    >
      {/* Drag Handle - desktop only */}
      {!isMobile && !isMinimized && (
        <div className={styles.dragHandle} title={t('board:dock.dragHint')}>
          <GripVertical size={16} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div
            key="minimized"
            className={styles.minimizedTrigger}
            onClick={handleToggleMinimize}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            title={t('board:dock.expand')}
          >
            <Brush size={20} />
            <ChevronUp size={14} />
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            className={styles.toolsContainer}
            variants={toolsVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Drawing Tools */}
            <motion.div className={styles.toolGroup} variants={toolItemVariants}>
              <ToolButton
                tool={TOOLS.BRUSH}
                currentTool={currentTool}
                onClick={handleToolSelect}
                title={t('board:toolbar.tool.brush')}
              >
                <Brush size={20} />
              </ToolButton>
              <ToolButton
                tool={TOOLS.ERASER}
                currentTool={currentTool}
                onClick={handleToolSelect}
                title={t('board:toolbar.tool.eraser')}
              >
                <Eraser size={20} />
              </ToolButton>
            </motion.div>

            <div className={styles.separator} />

            {/* Shape & Line Tools */}
            <motion.div className={styles.toolGroup} variants={toolItemVariants}>
              <ShapeToolsDropdown currentTool={currentTool} onToolSelect={handleToolSelect} />
              <LineToolsDropdown currentTool={currentTool} onToolSelect={handleToolSelect} />
            </motion.div>

            <div className={styles.separator} />

            {/* Text & Color Picker Tools */}
            <motion.div className={styles.toolGroup} variants={toolItemVariants}>
              <ToolButton
                tool={TOOLS.TEXT}
                currentTool={currentTool}
                onClick={handleToolSelect}
                title={t('board:toolbar.tool.text')}
              >
                <Type size={20} />
              </ToolButton>
              <ToolButton
                tool={TOOLS.COLOR_PICKER}
                currentTool={currentTool}
                onClick={handleToolSelect}
                title={t('board:toolbar.tool.colorPicker')}
              >
                <Pipette size={20} />
              </ToolButton>
            </motion.div>

            <div className={styles.separator} />

            {/* Color & Stroke Controls */}
            <motion.div className={styles.toolGroup} variants={toolItemVariants}>
              <div className={styles.colorPickerWrapper}>
                <ColorPicker
                  color={preferences.defaultStrokeColor}
                  onChange={handleColorChange}
                />
              </div>
              <div className={styles.strokeControl}>
                <Slider
                  value={preferences.defaultStrokeWidth}
                  onChange={handleStrokeWidthChange}
                  min={1}
                  max={50}
                  step={1}
                  label={t('board:toolbar.strokeWidth')}
                  showValue
                />
              </div>
            </motion.div>

            {/* Minimize Button */}
            <button
              className={styles.minimizeButton}
              onClick={handleToggleMinimize}
              title={t('board:dock.minimize')}
            >
              <ChevronDown size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FloatingDock;
