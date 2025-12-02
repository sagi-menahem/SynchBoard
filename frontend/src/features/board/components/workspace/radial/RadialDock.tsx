import { TOOLS } from 'features/board/constants/BoardConstants';
import { useToolPreferences } from 'features/settings/ToolPreferencesProvider';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import {
  ArrowRight,
  Brush,
  ChevronUp,
  Circle,
  Eraser,
  Hexagon,
  Minus,
  MoreHorizontal,
  Palette,
  Pentagon,
  PenTool,
  Pipette,
  Square,
  Star,
  Triangle,
  Type,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Tool } from 'shared/types/CommonTypes';

import styles from './RadialDock.module.scss';
import { SatelliteManager } from './SatelliteManager';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Detects if the device is mobile based on device characteristics,
 * not just viewport width. This ensures phones stay in mobile mode
 * even when rotated to landscape orientation.
 */
const detectMobileDevice = (): boolean => {
  // Check for mobile user agent
  const isMobileUserAgent = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Check for touch capability
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // If it's a mobile device (phone/tablet), always use mobile UI
  // Otherwise, fall back to width check for desktop responsiveness
  return isMobileUserAgent || (hasTouchScreen && window.innerWidth < 1024);
};

// Shape tools that should trigger shapes satellite active state
const SHAPE_TOOLS = [
  TOOLS.SQUARE,
  TOOLS.CIRCLE,
  TOOLS.TRIANGLE,
  TOOLS.PENTAGON,
  TOOLS.HEXAGON,
  TOOLS.STAR,
] as const;

// Line tools that should trigger lines satellite active state
const LINE_TOOLS = [TOOLS.LINE, TOOLS.ARROW, TOOLS.DOTTED_LINE] as const;

// Helper function to get icon for shape tools based on current selection
const getShapeIcon = (currentTool: Tool, size = 20): React.ReactNode => {
  switch (currentTool) {
    case TOOLS.SQUARE:
      return <Square size={size} />;
    case TOOLS.CIRCLE:
      return <Circle size={size} />;
    case TOOLS.TRIANGLE:
      return <Triangle size={size} />;
    case TOOLS.PENTAGON:
      return <Pentagon size={size} />;
    case TOOLS.HEXAGON:
      return <Hexagon size={size} />;
    case TOOLS.STAR:
      return <Star size={size} />;
    default:
      return <Square size={size} />; // Default to square
  }
};

// Helper function to get icon for line tools based on current selection
const getLineIcon = (currentTool: Tool, size = 20): React.ReactNode => {
  switch (currentTool) {
    case TOOLS.LINE:
      return <Minus size={size} />;
    case TOOLS.ARROW:
      return <ArrowRight size={size} />;
    case TOOLS.DOTTED_LINE:
      return <MoreHorizontal size={size} />;
    default:
      return <Minus size={size} />; // Default to line
  }
};

// Helper function to check if a satellite button should show active state
const isSatelliteActive = (satelliteType: string, currentTool: Tool): boolean => {
  if (satelliteType === 'shapes') {
    return SHAPE_TOOLS.includes(currentTool as (typeof SHAPE_TOOLS)[number]);
  }
  if (satelliteType === 'lines') {
    return LINE_TOOLS.includes(currentTool as (typeof LINE_TOOLS)[number]);
  }
  return false;
};

// =============================================================================
// TYPES
// =============================================================================

interface RadialDockProps {
  /** Callback when satellite state changes (for coordinating with FloatingActions on mobile) */
  onSatelliteChange?: (satelliteType: string | null) => void;
  /** Canvas split ratio percentage (0-100) - used to position toolbar relative to canvas area on desktop */
  canvasSplitRatio?: number;
  /** Whether chat panel is open - affects toolbar positioning on desktop */
  isChatOpen?: boolean;
}

interface ToolItem {
  tool: Tool | string;
  type: 'direct' | 'satellite';
  label: string;
  icon?: React.ReactNode; // Make icon optional since we'll generate it dynamically
  isDynamic?: boolean; // Flag to indicate if icon should be generated dynamically
}

const DOCK_TOOLS: ToolItem[] = [
  { tool: TOOLS.BRUSH, type: 'direct', label: 'Brush', icon: <Brush size={20} /> },
  { tool: TOOLS.ERASER, type: 'direct', label: 'Eraser', icon: <Eraser size={20} /> },
  { tool: 'shapes', type: 'satellite', label: 'Shapes', isDynamic: true }, // Dynamic icon
  { tool: 'lines', type: 'satellite', label: 'Lines', isDynamic: true }, // Dynamic icon
  { tool: TOOLS.TEXT, type: 'direct', label: 'Text', icon: <Type size={20} /> },
  { tool: TOOLS.COLOR_PICKER, type: 'direct', label: 'Color Picker', icon: <Pipette size={20} /> },
  { tool: 'strokeProps', type: 'satellite', label: 'Stroke Width', icon: <PenTool size={20} /> },
  { tool: 'colorPalette', type: 'satellite', label: 'Palette', isDynamic: true }, // Dynamic color indicator
];

// =============================================================================
// COMPONENT
// =============================================================================

// Height of the expanded toolbar content (2 rows × 44px tools + gaps + padding)
const TOOLBAR_HEIGHT_MOBILE = 120; // 2 rows of tools (~88px) + padding (~32px)
// Threshold for drag to trigger open (percentage of toolbar height)
const DRAG_OPEN_THRESHOLD = 0.3;

export const RadialDock: React.FC<RadialDockProps> = ({
  onSatelliteChange,
  canvasSplitRatio = 70,
  isChatOpen = true,
}) => {
  const { preferences, updateTool, updateDockMinimized } = useToolPreferences();

  // =========================================================================
  // STATE
  // =========================================================================

  const [isMobile, setIsMobile] = useState(detectMobileDevice());
  const [isExpanded, setIsExpanded] = useState(!preferences.isDockMinimized);
  const [activeSatellite, setActiveSatellite] = useState<string | null>(null);

  // Drag state for mobile pull-up gesture
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const toolbarContentRef = useRef<HTMLDivElement>(null);

  // Reset drag state when expanded changes
  useEffect(() => {
    if (isExpanded) {
      setDragY(0);
      setIsDragging(false);
    }
  }, [isExpanded]);

  // =========================================================================
  // EFFECTS
  // =========================================================================

  useEffect(() => {
    setIsExpanded(!preferences.isDockMinimized);
  }, [preferences.isDockMinimized]);

  // Notify parent when satellite state changes
  useEffect(() => {
    onSatelliteChange?.(activeSatellite);
  }, [activeSatellite, onSatelliteChange]);

  // Viewport resize handler
  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);

      resizeTimeout = setTimeout(() => {
        const mobile = detectMobileDevice();
        setIsMobile(mobile);
      }, 100);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, []);

  // Toggle body class for FloatingActions to respond on mobile
  useEffect(() => {
    if (isMobile && isExpanded) {
      document.body.classList.add('dock-expanded');
    } else {
      document.body.classList.remove('dock-expanded');
    }

    return () => {
      document.body.classList.remove('dock-expanded');
    };
  }, [isMobile, isExpanded]);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleToggleExpand = useCallback(() => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    void updateDockMinimized(!newExpanded);

    if (!newExpanded) {
      setActiveSatellite(null);
    }
  }, [isExpanded, updateDockMinimized]);

  const handleToolSelect = useCallback(
    (tool: Tool) => {
      void updateTool(tool);
      setActiveSatellite(null);

      // Auto-collapse toolbar on mobile after tool selection
      if (isMobile) {
        setIsExpanded(false);
        void updateDockMinimized(true);
      }
    },
    [updateTool, isMobile, updateDockMinimized],
  );

  const handleOpenSatellite = useCallback((satelliteType: string) => {
    setActiveSatellite((prev) => (prev === satelliteType ? null : satelliteType));
  }, []);

  // =========================================================================
  // MOBILE DRAG HANDLERS
  // =========================================================================

  const handleDragStart = useCallback(() => {
    if (!isMobile) return;
    setIsDragging(true);
  }, [isMobile]);

  const handleDrag = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!isMobile) return;
      // info.offset.y is negative when dragging up, positive when dragging down
      // Clamp based on current state
      if (isExpanded) {
        // When open, only allow dragging down (positive values) to close
        const newDragY = Math.max(0, Math.min(TOOLBAR_HEIGHT_MOBILE, info.offset.y));
        setDragY(newDragY);
      } else {
        // When closed, only allow dragging up (negative values) to open
        const newDragY = Math.min(0, Math.max(-TOOLBAR_HEIGHT_MOBILE, info.offset.y));
        setDragY(newDragY);
      }
    },
    [isMobile, isExpanded],
  );

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!isMobile) return;
      setIsDragging(false);
      setDragY(0);

      const dragDistance = Math.abs(info.offset.y);
      const threshold = TOOLBAR_HEIGHT_MOBILE * DRAG_OPEN_THRESHOLD;
      const velocityThreshold = 300;

      if (isExpanded) {
        // Currently open - check if should close (drag down)
        if (
          info.offset.y > threshold ||
          (info.velocity.y > velocityThreshold && dragDistance > 20)
        ) {
          setIsExpanded(false);
          void updateDockMinimized(true);
        }
      } else {
        // Currently closed - check if should open (drag up)
        if (
          info.offset.y < -threshold ||
          (info.velocity.y < -velocityThreshold && dragDistance > 20)
        ) {
          setIsExpanded(true);
          void updateDockMinimized(false);
        }
      }
      // Otherwise framer-motion will snap back automatically due to dragConstraints
    },
    [isMobile, isExpanded, updateDockMinimized],
  );

  // =========================================================================
  // RENDER HELPERS
  // =========================================================================

  const getToolIcon = useCallback(
    (item: ToolItem, size = 20): React.ReactNode => {
      if (!item.isDynamic) {
        return item.icon;
      }

      // Dynamic icons based on current tool
      if (item.tool === 'shapes') {
        return getShapeIcon(preferences.defaultTool, size);
      }
      if (item.tool === 'lines') {
        return getLineIcon(preferences.defaultTool, size);
      }
      if (item.tool === 'colorPalette') {
        return (
          <div className={styles.colorPaletteIcon}>
            <Palette size={size} />
            <div
              className={styles.colorIndicator}
              style={{ backgroundColor: preferences.defaultStrokeColor }}
            />
          </div>
        );
      }

      return item.icon;
    },
    [preferences.defaultTool, preferences.defaultStrokeColor],
  );

  const isToolActive = useCallback(
    (item: ToolItem): boolean => {
      if (item.type === 'direct') {
        return preferences.defaultTool === item.tool;
      }
      // For satellite buttons, check if current tool belongs to that category
      return isSatelliteActive(item.tool as string, preferences.defaultTool);
    },
    [preferences.defaultTool],
  );

  // =========================================================================
  // RENDER
  // =========================================================================

  const activeToolIcon = useMemo(() => {
    // Find the active tool in DOCK_TOOLS
    const directTool = DOCK_TOOLS.find(
      (t) => t.type === 'direct' && t.tool === preferences.defaultTool,
    );
    if (directTool) {
      return getToolIcon(directTool, 20);
    }

    // Check if it's a shape tool
    if (SHAPE_TOOLS.includes(preferences.defaultTool as (typeof SHAPE_TOOLS)[number])) {
      return getShapeIcon(preferences.defaultTool, 20);
    }

    // Check if it's a line tool
    if (LINE_TOOLS.includes(preferences.defaultTool as (typeof LINE_TOOLS)[number])) {
      return getLineIcon(preferences.defaultTool, 20);
    }

    // Default fallback
    return <Brush size={20} />;
  }, [preferences.defaultTool, getToolIcon]);

  // Calculate toolbar height to show based on drag progress
  // When closed and dragging up: dragY goes from 0 to -TOOLBAR_HEIGHT_MOBILE
  // When open and dragging down: dragY goes from 0 to +TOOLBAR_HEIGHT_MOBILE
  const getToolbarHeight = () => {
    if (isDragging) {
      if (isExpanded) {
        // Open, dragging down to close: reduce height
        const closeProgress = Math.max(0, dragY) / TOOLBAR_HEIGHT_MOBILE;
        return TOOLBAR_HEIGHT_MOBILE * (1 - closeProgress);
      } else {
        // Closed, dragging up to open: increase height
        const openProgress = Math.abs(Math.min(0, dragY)) / TOOLBAR_HEIGHT_MOBILE;
        return TOOLBAR_HEIGHT_MOBILE * openProgress;
      }
    }
    return isExpanded ? TOOLBAR_HEIGHT_MOBILE : 0;
  };

  const toolbarHeight = getToolbarHeight();

  // Layout constants - calculated from SCSS:
  // Tool: 40px, 9 buttons (8 tools + close), 8 gaps × 6px = 48px, padding 16px = 424px total
  const TOOLBAR_WIDTH = 424;
  // Floating actions: left: 25px + zoom pill ~180px wide = 205px from left edge
  const FLOATING_ACTIONS_WIDTH = 210; // Add some buffer
  // Minimum canvas width = floating actions (210) + toolbar (424) + right margin (20) = 654px
  const MIN_CANVAS_WIDTH_FOR_HORIZONTAL = 660;
  const RIGHT_MARGIN = 20; // Margin from right edge of canvas (to not touch chat panel)

  // Track window width for responsive layout calculations
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200,
  );

  // Listen to window resize events
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate canvas width in pixels
  const canvasWidthPx = useMemo(() => {
    const canvasWidthPercent = isChatOpen ? canvasSplitRatio : 100;
    return (windowWidth * canvasWidthPercent) / 100;
  }, [isChatOpen, canvasSplitRatio, windowWidth]);

  // Calculate if we should use vertical layout based on available canvas width
  const useVerticalLayout = useMemo(() => {
    if (isMobile) return false;
    return canvasWidthPx < MIN_CANVAS_WIDTH_FOR_HORIZONTAL;
  }, [isMobile, canvasWidthPx]);

  // Calculate the position of the toolbar on desktop
  const getDesktopToolbarStyle = useMemo((): React.CSSProperties => {
    if (isMobile) return {};

    // Distance from window right edge to canvas right edge (chat panel width)
    const chatPanelWidth = windowWidth - canvasWidthPx;

    if (useVerticalLayout) {
      // Vertical layout: bottom-right of canvas, with margin from chat panel
      return {
        right: `${chatPanelWidth + RIGHT_MARGIN}px`,
        left: 'auto',
        bottom: '32px',
        top: 'auto',
        transform: 'none',
      };
    }

    // Horizontal layout positioning:
    // Goal: Center toolbar in canvas, but shift right if it overlaps floating buttons,
    // and ensure it never extends into the chat panel area.

    const canvasCenterPx = canvasWidthPx / 2;
    const toolbarHalfWidth = TOOLBAR_WIDTH / 2;

    // Calculate where toolbar edges would be if centered
    const toolbarLeftIfCentered = canvasCenterPx - toolbarHalfWidth;
    const toolbarRightIfCentered = canvasCenterPx + toolbarHalfWidth;

    // Available space for toolbar: from floating actions to right edge of canvas
    const availableLeft = FLOATING_ACTIONS_WIDTH;
    const availableRight = canvasWidthPx - RIGHT_MARGIN;
    const availableWidth = availableRight - availableLeft;

    // If centered position doesn't fit in available space, calculate best position
    if (toolbarLeftIfCentered < availableLeft || toolbarRightIfCentered > availableRight) {
      // Calculate the optimal position: center within available space
      const availableCenterPx = availableLeft + availableWidth / 2;

      // If toolbar fits in available space, center it there
      if (TOOLBAR_WIDTH <= availableWidth) {
        return {
          left: `${availableCenterPx}px`,
          right: 'auto',
          bottom: '32px',
          top: 'auto',
          transform: 'translateX(-50%)',
        };
      }

      // Toolbar doesn't fit well - position from right edge to ensure no cutoff by chat
      return {
        right: `${chatPanelWidth + RIGHT_MARGIN}px`,
        left: 'auto',
        bottom: '32px',
        top: 'auto',
        transform: 'none',
      };
    }

    // Centered position works perfectly
    return {
      left: `${canvasCenterPx}px`,
      right: 'auto',
      bottom: '32px',
      top: 'auto',
      transform: 'translateX(-50%)',
    };
  }, [isMobile, useVerticalLayout, canvasWidthPx, windowWidth]);

  return (
    <>
      <div
        className={`${styles.fixedToolbar} ${isMobile ? styles.mobile : styles.desktop} ${useVerticalLayout ? styles.vertical : ''}`}
        style={getDesktopToolbarStyle}
      >
        {/* MOBILE: Bottom sheet - tab on top, toolbar expands downward below tab */}
        {isMobile ? (
          <div className={styles.mobileToolbarContainer} data-testid="mobile-toolbar-container">
            {/* The tab - sits on top, pan gestures control toolbar height (tab doesn't move) */}
            <motion.button
              className={styles.collapsedTrigger}
              data-testid="mobile-tab"
              onClick={handleToggleExpand}
              onPanStart={handleDragStart}
              onPan={handleDrag}
              onPanEnd={handleDragEnd}
              style={{ touchAction: 'none' }}
            >
              {/* Chevron indicator - points up when closed (to open), down when open (to close) */}
              {/* Uses muted gray for subtle visual hierarchy - arrow is secondary UI element */}
              <motion.div
                className={styles.chevronIndicator}
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronUp size={16} />
              </motion.div>
              {/* Tool icon colored with current stroke color (or primary text for eraser) */}
              <div
                className={styles.mobileTabToolIcon}
                style={{
                  color:
                    preferences.defaultTool === TOOLS.ERASER
                      ? 'var(--color-text-primary)'
                      : preferences.defaultStrokeColor,
                }}
              >
                {activeToolIcon}
              </div>
            </motion.button>

            {/* Toolbar - expands downward below the tab */}
            <motion.div
              className={`${styles.expandedToolbar} ${styles.mobileToolbar}`}
              data-testid="mobile-toolbar"
              data-expanded={isExpanded}
              animate={{
                height: isDragging ? toolbarHeight : isExpanded ? TOOLBAR_HEIGHT_MOBILE : 0,
              }}
              transition={
                isDragging
                  ? { duration: 0 }
                  : {
                      type: 'spring',
                      stiffness: 400,
                      damping: 28,
                    }
              }
            >
              {/* Inner wrapper holds padding - gets clipped by overflow:hidden on parent */}
              <div className={styles.mobileToolbarContent}>
                <div className={styles.toolsGrid}>
                  {DOCK_TOOLS.map((item) => {
                    const isActive = isToolActive(item);
                    return (
                      <button
                        key={item.label}
                        className={`${styles.toolButton} ${isActive ? styles.active : ''}`}
                        onClick={() =>
                          item.type === 'direct'
                            ? handleToolSelect(item.tool as Tool)
                            : handleOpenSatellite(item.tool as string)
                        }
                        title={item.label}
                      >
                        {/* Wrapper for icon + indicator (same structure as colorPaletteIcon) */}
                        <div className={styles.toolIconWrapper}>
                          {getToolIcon(item, 20)}
                          {/* Underline indicator for active tool - uses stroke color (or primary text for eraser) */}
                          {isActive && (
                            <span
                              className={styles.activeIndicator}
                              style={{
                                backgroundColor:
                                  item.tool === TOOLS.ERASER
                                    ? 'var(--color-text-primary)'
                                    : preferences.defaultStrokeColor,
                              }}
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          /* DESKTOP: Fast, smooth AnimatePresence with optimized timing */
          <AnimatePresence mode="wait" initial={false}>
            {!isExpanded ? (
              <motion.button
                key="collapsed-trigger"
                className={styles.collapsedTrigger}
                onClick={handleToggleExpand}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.12,
                  ease: 'easeOut',
                }}
              >
                <div>{activeToolIcon}</div>
                {preferences.defaultTool !== TOOLS.ERASER && (
                  <div
                    className={styles.collapsedColorIndicator}
                    style={{ backgroundColor: preferences.defaultStrokeColor }}
                  />
                )}
              </motion.button>
            ) : (
              <motion.div
                key="expanded-toolbar"
                ref={toolbarContentRef}
                className={`${styles.expandedToolbar} ${useVerticalLayout ? styles.verticalToolbar : ''}`}
                initial={
                  useVerticalLayout ? { height: 56, opacity: 0.5 } : { width: 56, opacity: 0.5 }
                }
                animate={
                  useVerticalLayout ? { height: 'auto', opacity: 1 } : { width: 'auto', opacity: 1 }
                }
                exit={
                  useVerticalLayout ? { height: 56, opacity: 0.5 } : { width: 56, opacity: 0.5 }
                }
                transition={{
                  duration: 0.18,
                  ease: [0.4, 0, 0.2, 1],
                  opacity: { duration: 0.1 },
                }}
              >
                <motion.div
                  className={`${styles.toolsRow} ${useVerticalLayout ? styles.toolsColumn : ''}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.08 }}
                >
                  {DOCK_TOOLS.map((item) => {
                    const isActive = isToolActive(item);
                    return (
                      <button
                        key={item.label}
                        className={`${styles.toolButton} ${isActive ? styles.active : ''}`}
                        onClick={() =>
                          item.type === 'direct'
                            ? handleToolSelect(item.tool as Tool)
                            : handleOpenSatellite(item.tool as string)
                        }
                        title={item.label}
                      >
                        {getToolIcon(item, 20)}
                      </button>
                    );
                  })}

                  {/* Close button integrated into toolbar */}
                  <button
                    className={styles.closeButton}
                    onClick={handleToggleExpand}
                    title="Collapse toolbar"
                  >
                    <ChevronUp size={20} className={styles.closeIcon} />
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Satellite Manager - Rendered outside toolbar to avoid transform context issues */}
      <SatelliteManager
        activeSatellite={activeSatellite}
        onClose={() => setActiveSatellite(null)}
        isMobile={isMobile}
        onCollapse={handleToggleExpand}
      />
    </>
  );
};

export default RadialDock;
