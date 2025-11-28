import { TOOLS } from 'features/board/constants/BoardConstants';
import { useToolPreferences } from 'features/settings/ToolPreferencesProvider';
import type { DockAnchor } from 'features/settings/types/UserTypes';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { Brush, ChevronDown, ChevronUp, Eraser, GripVertical, Pipette, Type } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Tool } from 'shared/types/CommonTypes';
import { ColorPicker, Slider, ToolButton } from 'shared/ui';
import { isRTL } from 'shared/utils/rtlUtils';

import { LineToolsDropdown } from './LineToolsDropdown';
import { ShapeToolsDropdown } from './ShapeToolsDropdown';

import styles from './FloatingDock.module.scss';

/**
 * Resize debounce delay in milliseconds.
 */
const RESIZE_DEBOUNCE_MS = 100;

/**
 * Allowed dock anchors - 5 positions, dynamically excluding one based on RTL/LTR.
 */
type AllowedDockAnchor =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * Margin from viewport edges in pixels.
 */
const EDGE_MARGIN = 20;

/**
 * Mobile breakpoint width in pixels.
 */
const MOBILE_BREAKPOINT = 768;

/**
 * Minimum drag distance (px) to differentiate drag from click.
 */
const DRAG_THRESHOLD = 5;

/**
 * Header height offset for top anchors.
 */
const HEADER_HEIGHT = 56;

/**
 * Get allowed anchors based on language direction.
 * - LTR: Exclude bottom-left (FloatingActions is there)
 * - RTL: Exclude bottom-right (FloatingActions is there)
 */
const getAllowedAnchors = (isRTLMode: boolean): AllowedDockAnchor[] => {
  if (isRTLMode) {
    // RTL: FloatingActions at bottom-right, so exclude bottom-right for dock
    return ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center'];
  } else {
    // LTR: FloatingActions at bottom-left, so exclude bottom-left for dock
    return ['top-left', 'top-center', 'top-right', 'bottom-center', 'bottom-right'];
  }
};

/**
 * Calculate pixel position for an anchor.
 */
const getAnchorPosition = (
  anchor: AllowedDockAnchor,
  containerWidth: number,
  containerHeight: number,
  dockWidth: number,
  dockHeight: number,
): { x: number; y: number } => {
  const positions: Record<AllowedDockAnchor, { x: number; y: number }> = {
    'top-left': {
      x: EDGE_MARGIN,
      y: EDGE_MARGIN + HEADER_HEIGHT,
    },
    'top-center': {
      x: Math.max(EDGE_MARGIN, (containerWidth - dockWidth) / 2),
      y: EDGE_MARGIN + HEADER_HEIGHT,
    },
    'top-right': {
      x: Math.max(EDGE_MARGIN, containerWidth - dockWidth - EDGE_MARGIN),
      y: EDGE_MARGIN + HEADER_HEIGHT,
    },
    'bottom-left': {
      x: EDGE_MARGIN,
      y: Math.max(EDGE_MARGIN, containerHeight - dockHeight - EDGE_MARGIN),
    },
    'bottom-center': {
      x: Math.max(EDGE_MARGIN, (containerWidth - dockWidth) / 2),
      y: Math.max(EDGE_MARGIN, containerHeight - dockHeight - EDGE_MARGIN),
    },
    'bottom-right': {
      x: Math.max(EDGE_MARGIN, containerWidth - dockWidth - EDGE_MARGIN),
      y: Math.max(EDGE_MARGIN, containerHeight - dockHeight - EDGE_MARGIN),
    },
  };

  return positions[anchor] || positions['bottom-center'];
};

/**
 * Find the nearest allowed anchor from a given position.
 */
const findNearestAnchor = (
  x: number,
  y: number,
  containerWidth: number,
  containerHeight: number,
  dockWidth: number,
  dockHeight: number,
  allowedAnchors: AllowedDockAnchor[],
): AllowedDockAnchor => {
  let nearestAnchor: AllowedDockAnchor = 'bottom-center';
  let minDistance = Infinity;

  for (const anchor of allowedAnchors) {
    const pos = getAnchorPosition(anchor, containerWidth, containerHeight, dockWidth, dockHeight);
    const distance = Math.hypot(x - pos.x, y - pos.y);

    if (distance < minDistance) {
      minDistance = distance;
      nearestAnchor = anchor;
    }
  }

  return nearestAnchor;
};

/**
 * Map any anchor to a valid allowed anchor based on RTL mode.
 */
const mapToAllowedAnchor = (
  anchor: DockAnchor | undefined,
  isRTLMode: boolean,
): AllowedDockAnchor => {
  const allowedAnchors = getAllowedAnchors(isRTLMode);
  const defaultAnchor: AllowedDockAnchor = 'bottom-center';

  if (!anchor) return defaultAnchor;

  // Check if anchor is in allowed list
  if (allowedAnchors.includes(anchor as AllowedDockAnchor)) {
    return anchor as AllowedDockAnchor;
  }

  // Map forbidden anchors to nearest allowed
  if (isRTLMode && anchor === 'bottom-right') {
    return 'bottom-center';
  }
  if (!isRTLMode && anchor === 'bottom-left') {
    return 'bottom-center';
  }

  // Map legacy side anchors
  if (anchor === 'left-center') return 'bottom-left';
  if (anchor === 'right-center') return 'bottom-right';

  return defaultAnchor;
};

/**
 * FloatingDock component - Always-horizontal draggable toolbar for drawing tools.
 *
 * Features:
 * - Draggable with strict snapping to allowed anchors (RTL/LTR aware)
 * - Always horizontal layout
 * - Minimize/expand with drag-vs-click detection
 * - Mobile: locked to bottom-center, drag disabled
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

  const dockRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const hasDragged = useRef(false);
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use refs for values that don't need to trigger re-renders
  const dockSizeRef = useRef({ width: 500, height: 56 });
  const containerSizeRef = useRef({ width: window.innerWidth, height: window.innerHeight });

  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [isDragging, setIsDragging] = useState(false);

  // RTL detection - memoized to prevent unnecessary recalculations
  const isRTLMode = useMemo(() => isRTL(i18n.language), [i18n.language]);
  const allowedAnchors = useMemo(() => getAllowedAnchors(isRTLMode), [isRTLMode]);

  // Current anchor position
  const [currentAnchor, setCurrentAnchor] = useState<AllowedDockAnchor>(() =>
    mapToAllowedAnchor(preferences.dockAnchor, isRTL(i18n.language)),
  );

  // Minimized state
  const [isMinimized, setIsMinimized] = useState(preferences.isDockMinimized || false);

  // Calculated position based on anchor
  const [position, setPosition] = useState(() => {
    const rtl = isRTL(i18n.language);
    const anchor = mapToAllowedAnchor(preferences.dockAnchor, rtl);
    return getAnchorPosition(anchor, window.innerWidth, window.innerHeight, 500, 56);
  });

  // Calculate position for a given anchor - stable function
  const calculatePosition = useCallback(
    (anchor: AllowedDockAnchor, width: number, height: number, dockW: number, dockH: number) => {
      return getAnchorPosition(anchor, width, height, dockW, dockH);
    },
    [],
  );

  // Update position only if it actually changed
  const updatePositionIfChanged = useCallback(
    (newPos: { x: number; y: number }) => {
      setPosition((prev) => {
        if (prev.x === newPos.x && prev.y === newPos.y) {
          return prev; // No change, don't trigger re-render
        }
        return newPos;
      });
    },
    [],
  );

  // Find the workspace container for drag constraints (runs once)
  useEffect(() => {
    const container = document.querySelector('[data-board-page]') as HTMLElement;
    if (container) {
      containerRef.current = container;
      const rect = container.getBoundingClientRect();
      containerSizeRef.current = { width: rect.width, height: rect.height };
    }
  }, []);

  // Sync with preferences changes
  useEffect(() => {
    const newAnchor = mapToAllowedAnchor(preferences.dockAnchor, isRTLMode);
    setCurrentAnchor((prev) => (prev === newAnchor ? prev : newAnchor));
    setIsMinimized(preferences.isDockMinimized || false);
  }, [preferences.dockAnchor, preferences.isDockMinimized, isRTLMode]);

  // Handle viewport resize and mobile detection - debounced
  useEffect(() => {
    const handleResize = () => {
      // Clear any pending debounce
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = setTimeout(() => {
        const mobile = window.innerWidth < MOBILE_BREAKPOINT;

        // Update container size ref
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          containerSizeRef.current = { width: rect.width, height: rect.height };
        } else {
          containerSizeRef.current = { width: window.innerWidth, height: window.innerHeight };
        }

        // Only update mobile state if it changed
        setIsMobile((prevMobile) => {
          if (prevMobile === mobile) return prevMobile;
          return mobile;
        });

        // Recalculate position
        setCurrentAnchor((prevAnchor) => {
          const effectiveAnchor = mobile ? 'bottom-center' : prevAnchor;
          const newPos = calculatePosition(
            effectiveAnchor,
            containerSizeRef.current.width,
            containerSizeRef.current.height,
            dockSizeRef.current.width,
            dockSizeRef.current.height,
          );
          updatePositionIfChanged(newPos);
          return prevAnchor; // Don't change anchor
        });
      }, RESIZE_DEBOUNCE_MS);
    };

    // Initial calculation without debounce
    const initialMobile = window.innerWidth < MOBILE_BREAKPOINT;
    setIsMobile(initialMobile);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      containerSizeRef.current = { width: rect.width, height: rect.height };
    }

    const effectiveAnchor = initialMobile ? 'bottom-center' : currentAnchor;
    const initialPos = calculatePosition(
      effectiveAnchor,
      containerSizeRef.current.width,
      containerSizeRef.current.height,
      dockSizeRef.current.width,
      dockSizeRef.current.height,
    );
    updatePositionIfChanged(initialPos);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
    // Only re-bind listener if anchor changes (needed for correct position calc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAnchor]);

  // Measure dock size after render - only when minimized state changes
  useEffect(() => {
    // Use requestAnimationFrame to measure after paint
    const rafId = requestAnimationFrame(() => {
      if (dockRef.current) {
        const rect = dockRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const sizeChanged =
            dockSizeRef.current.width !== rect.width || dockSizeRef.current.height !== rect.height;

          if (sizeChanged) {
            dockSizeRef.current = { width: rect.width, height: rect.height };

            // Update position with actual size
            const effectiveAnchor = isMobile ? 'bottom-center' : currentAnchor;
            const newPos = calculatePosition(
              effectiveAnchor,
              containerSizeRef.current.width,
              containerSizeRef.current.height,
              rect.width,
              rect.height,
            );
            updatePositionIfChanged(newPos);
          }
        }
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [isMinimized, currentAnchor, isMobile, calculatePosition, updatePositionIfChanged]);

  // Re-validate anchor when RTL mode changes
  useEffect(() => {
    const validAnchor = mapToAllowedAnchor(currentAnchor, isRTLMode);
    if (validAnchor !== currentAnchor) {
      setCurrentAnchor(validAnchor);
      const newPos = calculatePosition(
        validAnchor,
        containerSizeRef.current.width,
        containerSizeRef.current.height,
        dockSizeRef.current.width,
        dockSizeRef.current.height,
      );
      updatePositionIfChanged(newPos);
      void updateDockAnchor(validAnchor as DockAnchor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRTLMode]);

  /**
   * Handle drag start - record starting position.
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
   * Handle drag end - snap to nearest allowed anchor.
   */
  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      dragStartPos.current = null;

      if (isMobile) return;

      // Calculate where the dock ended up
      const finalX = position.x + info.offset.x;
      const finalY = position.y + info.offset.y;

      const width = containerSizeRef.current.width;
      const height = containerSizeRef.current.height;

      // Find nearest allowed anchor
      const newAnchor = findNearestAnchor(
        finalX,
        finalY,
        width,
        height,
        dockSizeRef.current.width,
        dockSizeRef.current.height,
        allowedAnchors,
      );

      // Update state and animate to anchor
      setCurrentAnchor(newAnchor);
      const newPos = getAnchorPosition(
        newAnchor,
        width,
        height,
        dockSizeRef.current.width,
        dockSizeRef.current.height,
      );
      updatePositionIfChanged(newPos);

      // Persist to backend
      void updateDockAnchor(newAnchor as DockAnchor);
    },
    [isMobile, position, allowedAnchors, updateDockAnchor, updatePositionIfChanged],
  );

  /**
   * Toggle minimized state - only if not dragging.
   */
  const handleToggleMinimize = useCallback(() => {
    // Block expand if user was dragging
    if (hasDragged.current) {
      hasDragged.current = false;
      return;
    }

    const newMinimized = !isMinimized;
    setIsMinimized(newMinimized);
    void updateDockMinimized(newMinimized);
  }, [isMinimized, updateDockMinimized]);

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

  // Drag constraints - keep dock fully visible (memoized to prevent recreation)
  const dragConstraints = useMemo(
    () => ({
      left: EDGE_MARGIN,
      right: Math.max(0, containerSizeRef.current.width - dockSizeRef.current.width - EDGE_MARGIN),
      top: EDGE_MARGIN + HEADER_HEIGHT,
      bottom: Math.max(
        0,
        containerSizeRef.current.height - dockSizeRef.current.height - EDGE_MARGIN,
      ),
    }),
    // Recalculate when position changes (which happens after resize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [position],
  );

  // Animation variants for tools
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

  return (
    <motion.div
      ref={dockRef}
      className={`${styles.dock} ${isDragging ? styles.dragging : ''}`}
      drag={!isMobile}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={dragConstraints}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
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
