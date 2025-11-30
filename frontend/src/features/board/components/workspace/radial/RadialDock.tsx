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
import { Brush, Eraser, GripHorizontal, Minus, Palette, Pipette, Square, Type, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Tool } from 'shared/types/CommonTypes';
import { isRTL } from 'shared/utils/rtlUtils';

import { SatelliteManager } from './SatelliteManager';

import styles from './RadialDock.module.scss';

// =============================================================================
// CONSTANTS
// =============================================================================

const EDGE_MARGIN = 24; // Visual margin from screen edge
const MOBILE_BREAKPOINT = 768;
const DRAG_THRESHOLD = 5;
const HEADER_HEIGHT = 56;

// Dimensions
const BUTTON_SIZE = 44;
const BUTTON_SIZE_MOBILE = 40;

// Spring animation for snapping
const SNAP_SPRING = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
    mass: 1,
};

// =============================================================================
// TYPES
// =============================================================================

type AllowedDockAnchor =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center';

interface ToolItem {
    tool: Tool | string;
    type: 'direct' | 'satellite';
    label: string;
    icon: React.ReactNode;
}

const DOCK_TOOLS: ToolItem[] = [
    { tool: TOOLS.BRUSH, type: 'direct', label: 'Brush', icon: <Brush size={20} /> },
    { tool: TOOLS.ERASER, type: 'direct', label: 'Eraser', icon: <Eraser size={20} /> },
    { tool: 'shapes', type: 'satellite', label: 'Shapes', icon: <Square size={20} /> },
    { tool: 'lines', type: 'satellite', label: 'Lines', icon: <Minus size={20} /> },
    { tool: TOOLS.TEXT, type: 'direct', label: 'Text', icon: <Type size={20} /> },
    { tool: TOOLS.COLOR_PICKER, type: 'direct', label: 'Color Picker', icon: <Pipette size={20} /> },
    { tool: 'strokeProps', type: 'satellite', label: 'Stroke', icon: <GripHorizontal size={20} /> },
    { tool: 'colorPalette', type: 'satellite', label: 'Palette', icon: <Palette size={20} /> },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const getAllowedAnchors = (isRTLMode: boolean): AllowedDockAnchor[] => {
    if (isRTLMode) {
        return ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center'];
    }
    // In LTR, bottom-left is reserved (e.g. for other UI), and now bottom-right is disabled.
    return ['top-left', 'top-center', 'top-right', 'bottom-center'];
};

const getAnchorPosition = (
    anchor: AllowedDockAnchor,
    viewportWidth: number,
    viewportHeight: number,
    buttonSize: number,
): { x: number; y: number } => {
    const margin = EDGE_MARGIN;
    const headerOffset = margin + HEADER_HEIGHT;
    const bottomOffset = viewportHeight - margin - buttonSize;
    const rightOffset = viewportWidth - margin - buttonSize;
    const centerX = (viewportWidth - buttonSize) / 2;

    const positions: Record<AllowedDockAnchor, { x: number; y: number }> = {
        'top-left': {
            x: margin,
            y: headerOffset,
        },
        'top-center': {
            x: centerX,
            y: headerOffset,
        },
        'top-right': {
            x: rightOffset,
            y: headerOffset,
        },
        'bottom-left': {
            x: margin,
            y: bottomOffset,
        },
        'bottom-center': {
            x: centerX,
            y: bottomOffset,
        },
    };

    return positions[anchor] || positions['bottom-center'];
};

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

    if (isRTLMode && anchor === 'bottom-right') return 'bottom-center';
    if (!isRTLMode && anchor === 'bottom-left') return 'bottom-center';
    if (anchor === 'bottom-right') return 'bottom-center'; // Explicitly disable bottom-right for everyone

    return defaultAnchor;
};

const calculateConstraints = (
    viewportWidth: number,
    viewportHeight: number,
    buttonSize: number,
) => {
    return {
        left: EDGE_MARGIN,
        right: viewportWidth - EDGE_MARGIN - buttonSize,
        top: EDGE_MARGIN + HEADER_HEIGHT,
        bottom: viewportHeight - EDGE_MARGIN - buttonSize,
    };
};


const findNearestAnchor = (
    x: number,
    y: number,
    viewportWidth: number,
    viewportHeight: number,
    allowedAnchors: AllowedDockAnchor[],
    buttonSize: number,
): AllowedDockAnchor => {
    let nearestAnchor: AllowedDockAnchor = 'bottom-center';
    let minDistance = Infinity;

    for (const anchor of allowedAnchors) {
        const anchorPos = getAnchorPosition(anchor, viewportWidth, viewportHeight, buttonSize);
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

export const RadialDock: React.FC = () => {
    const { i18n } = useTranslation(['board', 'common']);
    const {
        preferences,
        updateTool,
        updateDockAnchor,
        updateDockMinimized,
    } = useToolPreferences();

    // =========================================================================
    // REFS
    // =========================================================================

    const dragStartPos = useRef<{ x: number; y: number } | null>(null);
    const hasDragged = useRef(false);
    const dockRef = useRef<HTMLDivElement>(null);

    // =========================================================================
    // MOTION VALUES
    // =========================================================================

    const motionX = useMotionValue(0);
    const motionY = useMotionValue(0);

    // =========================================================================
    // STATE
    // =========================================================================

    const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

    const [isExpanded, setIsExpanded] = useState(!preferences.isDockMinimized);
    const [activeSatellite, setActiveSatellite] = useState<string | null>(null);

    // Mobile position state
    const [mobileDockPosition, setMobileDockPosition] = useState<'bottom' | 'top'>(() => {
        if (typeof window === 'undefined') return 'bottom';
        const saved = localStorage.getItem('synchboard_mobile_radial_dock_position');
        return saved === 'top' ? 'top' : 'bottom';
    });

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

    const buttonSize = isMobile ? BUTTON_SIZE_MOBILE : BUTTON_SIZE;

    const dragConstraints = useMemo(
        () => calculateConstraints(viewportSize.width, viewportSize.height, buttonSize),
        [viewportSize, buttonSize],
    );

    // =========================================================================
    // EXPANSION DIRECTION LOGIC
    // =========================================================================

    const anchorDirection = useMemo(() => {
        if (['top-left', 'bottom-left'].includes(currentAnchor)) return 'left';
        if (['top-right'].includes(currentAnchor)) return 'right';
        return 'center';
    }, [currentAnchor]);

    // Split tools for Center Trigger layout
    const midPoint = Math.ceil(DOCK_TOOLS.length / 2);
    const leftTools = DOCK_TOOLS.slice(0, midPoint);
    const rightTools = DOCK_TOOLS.slice(midPoint);

    // =========================================================================
    // SNAP TO ANCHOR
    // =========================================================================

    const snapToAnchor = useCallback(
        (anchor: AllowedDockAnchor, shouldAnimate = true) => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const currentButtonSize = vw < MOBILE_BREAKPOINT ? BUTTON_SIZE_MOBILE : BUTTON_SIZE;

            const targetPos = getAnchorPosition(anchor, vw, vh, currentButtonSize);

            if (shouldAnimate) {
                void animate(motionX, targetPos.x, SNAP_SPRING);
                void animate(motionY, targetPos.y, SNAP_SPRING);
            } else {
                motionX.set(targetPos.x);
                motionY.set(targetPos.y);
            }
        },
        [motionX, motionY],
    );

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    useEffect(() => {
        const anchor = mapToAllowedAnchor(preferences.dockAnchor, isRTLMode);
        setCurrentAnchor(anchor);
        void snapToAnchor(anchor, false);
    }, [preferences.dockAnchor, isRTLMode, snapToAnchor]);

    useEffect(() => {
        setIsExpanded(!preferences.isDockMinimized);
    }, [preferences.isDockMinimized]);

    // =========================================================================
    // VIEWPORT RESIZE
    // =========================================================================

    useEffect(() => {
        let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

        const handleResize = () => {
            if (resizeTimeout) clearTimeout(resizeTimeout);

            resizeTimeout = setTimeout(() => {
                const newWidth = window.innerWidth;
                const newHeight = window.innerHeight;
                const mobile = newWidth < MOBILE_BREAKPOINT;

                setViewportSize({ width: newWidth, height: newHeight });
                setIsMobile(mobile);

                const effectiveAnchor = mobile
                    ? (mobileDockPosition === 'bottom' ? 'bottom-center' : 'top-center')
                    : currentAnchor;
                void snapToAnchor(effectiveAnchor, true);
            }, 100);
        };

        handleResize();

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (resizeTimeout) clearTimeout(resizeTimeout);
        };
    }, [currentAnchor, snapToAnchor, mobileDockPosition]);

    // =========================================================================
    // MOBILE POSITION PERSISTENCE
    // =========================================================================

    useEffect(() => {
        localStorage.setItem('synchboard_mobile_radial_dock_position', mobileDockPosition);
    }, [mobileDockPosition]);

    useEffect(() => {
        if (isMobile) {
            const anchor = mobileDockPosition === 'bottom' ? 'bottom-center' : 'top-center';
            void snapToAnchor(anchor, true);
        }
    }, [mobileDockPosition, isMobile, snapToAnchor]);

    // =========================================================================
    // DRAG HANDLERS
    // =========================================================================

    const handleDragStart = useCallback(
        (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {

            hasDragged.current = false;
            dragStartPos.current = { x: info.point.x, y: info.point.y };
        },
        [],
    );

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

    const handleDragEnd = useCallback(
        (_event: MouseEvent | TouchEvent | PointerEvent, _info: PanInfo) => {

            dragStartPos.current = null;

            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const isMobileView = vw < MOBILE_BREAKPOINT;
            const currentButtonSize = isMobileView ? BUTTON_SIZE_MOBILE : BUTTON_SIZE;

            if (isMobile) {
                const currentY = motionY.get();
                const centerY = vh / 2;
                const newPosition = currentY < centerY ? 'top' : 'bottom';

                setMobileDockPosition(newPosition);

                const anchor = newPosition === 'bottom' ? 'bottom-center' : 'top-center';
                const targetPos = getAnchorPosition(anchor, vw, vh, currentButtonSize);

                void animate(motionX, targetPos.x, SNAP_SPRING);
                void animate(motionY, targetPos.y, SNAP_SPRING);
                return;
            }

            const currentX = motionX.get();
            const currentY = motionY.get();

            const nearestAnchor = findNearestAnchor(
                currentX,
                currentY,
                vw,
                vh,
                allowedAnchors,
                currentButtonSize,
            );

            setCurrentAnchor(nearestAnchor);

            const snapPos = getAnchorPosition(nearestAnchor, vw, vh, currentButtonSize);

            void animate(motionX, snapPos.x, SNAP_SPRING);
            void animate(motionY, snapPos.y, SNAP_SPRING);

            void updateDockAnchor(nearestAnchor as DockAnchor);
        },
        [isMobile, motionX, motionY, allowedAnchors, updateDockAnchor],
    );

    // =========================================================================
    // HANDLERS
    // =========================================================================

    const handleToggleExpand = useCallback(() => {
        if (hasDragged.current) {
            hasDragged.current = false;
            return;
        }

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
        },
        [updateTool],
    );

    const handleOpenSatellite = useCallback((satelliteType: string) => {
        setActiveSatellite((prev) => (prev === satelliteType ? null : satelliteType));
    }, []);

    // =========================================================================
    // RENDER
    // =========================================================================

    const activeToolIcon = useMemo(() => {
        const tool = DOCK_TOOLS.find(t => t.tool === preferences.defaultTool);
        return tool ? tool.icon : <Brush size={20} />;
    }, [preferences.defaultTool]);

    return (
        <motion.div
            ref={dockRef}
            className={styles.dockWrapper}
            drag={isMobile ? 'y' : true}
            dragMomentum={false}
            dragElastic={0.1}
            dragConstraints={dragConstraints}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{ x: motionX, y: motionY }}
            data-anchor={anchorDirection}
        >
            <motion.div
                className={`${styles.morphingContainer} ${isExpanded ? styles.expanded : styles.collapsed}`}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                <AnimatePresence mode="wait">
                    {!isExpanded ? (
                        <motion.button
                            key="collapsed-trigger"
                            layout="position"
                            className={styles.triggerButton}
                            onClick={handleToggleExpand}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.1 } }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeToolIcon}
                        </motion.button>
                    ) : (
                        <motion.div
                            key="expanded-content"
                            layout="position"
                            className={styles.toolsGrid}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.1 } }}
                            transition={{ duration: 0.2, delay: 0.05 }}
                            style={{ display: 'contents' }}
                        >
                            {/* Left Group */}
                            {leftTools.map((item) => {
                                const isActive = preferences.defaultTool === item.tool;
                                return (
                                    <button
                                        key={item.label}
                                        className={`${styles.toolButton} ${isActive ? styles.active : ''}`}
                                        onClick={() => item.type === 'direct' ? handleToolSelect(item.tool as Tool) : handleOpenSatellite(item.tool as string)}
                                        title={item.label}
                                    >
                                        {item.icon}
                                    </button>
                                );
                            })}

                            {/* Center Close Button */}
                            <button
                                className={`${styles.toolButton} ${styles.closeButton}`}
                                onClick={handleToggleExpand}
                                aria-label="Close dock"
                            >
                                <X size={20} />
                            </button>

                            {/* Right Group */}
                            {rightTools.map((item) => {
                                const isActive = preferences.defaultTool === item.tool;
                                return (
                                    <button
                                        key={item.label}
                                        className={`${styles.toolButton} ${isActive ? styles.active : ''}`}
                                        onClick={() => item.type === 'direct' ? handleToolSelect(item.tool as Tool) : handleOpenSatellite(item.tool as string)}
                                        title={item.label}
                                    >
                                        {item.icon}
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Satellite Manager */}
            <SatelliteManager
                activeSatellite={activeSatellite}
                dockPosition={{ x: motionX.get(), y: motionY.get() }}
                onClose={() => setActiveSatellite(null)}
            />
        </motion.div>
    );
};

export default RadialDock;
