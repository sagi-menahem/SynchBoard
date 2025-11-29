import { useToolPreferences } from 'features/settings/ToolPreferencesProvider';
import type { DockAnchor } from 'features/settings/types/UserTypes';
import {
    AnimatePresence,
    animate,
    motion,
    useMotionValue,
    type PanInfo,
} from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Tool } from 'shared/types/CommonTypes';
import { isRTL } from 'shared/utils/rtlUtils';

import { CentralTrigger } from './CentralTrigger';
import { RadialRing } from './RadialRing';
import { SatelliteManager } from './SatelliteManager';

import styles from './RadialDock.module.scss';

// =============================================================================
// CONSTANTS
// =============================================================================

const EDGE_MARGIN = 40;
const MOBILE_BREAKPOINT = 768;
const DRAG_THRESHOLD = 5;
const HEADER_HEIGHT = 56;
const DOCK_RADIUS = 80; // Radius of the tool ring (desktop)
const DOCK_RADIUS_MOBILE = 64; // Radius for mobile (tighter layout)
const BUTTON_SIZE = 48;
const BUTTON_SIZE_MOBILE = 44;

// Spring animation for snapping
const SNAP_SPRING = {
    type: 'spring' as const,
    stiffness: 120,
    damping: 22,
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
    | 'bottom-center'
    | 'bottom-right';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const getAllowedAnchors = (isRTLMode: boolean): AllowedDockAnchor[] => {
    if (isRTLMode) {
        return ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center'];
    }
    return ['top-left', 'top-center', 'top-right', 'bottom-center', 'bottom-right'];
};

/**
 * Calculate anchor position for radial dock.
 * CRITICAL: Accounts for circular expansion (radius) not rectangular bounds.
 * Position is for the CENTER of the dock, not top-left corner.
 */
const getAnchorPosition = (
    anchor: AllowedDockAnchor,
    viewportWidth: number,
    viewportHeight: number,
    radius: number,
    buttonSize: number,
): { x: number; y: number } => {
    const offset = radius + buttonSize / 2;
    const safeDistance = radius + EDGE_MARGIN;

    const positions: Record<AllowedDockAnchor, { x: number; y: number }> = {
        'top-left': {
            x: safeDistance - offset,
            y: safeDistance + HEADER_HEIGHT - offset,
        },
        'top-center': {
            x: viewportWidth / 2 - offset,
            y: safeDistance + HEADER_HEIGHT - offset,
        },
        'top-right': {
            x: viewportWidth - (safeDistance + offset),
            y: safeDistance + HEADER_HEIGHT - offset,
        },
        'bottom-left': {
            x: safeDistance - offset,
            y: viewportHeight - (safeDistance + offset),
        },
        'bottom-center': {
            x: viewportWidth / 2 - offset,
            y: viewportHeight - (safeDistance + offset),
        },
        'bottom-right': {
            x: viewportWidth - (safeDistance + offset),
            y: viewportHeight - (safeDistance + offset),
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

    return defaultAnchor;
};

const calculateConstraints = (
    viewportWidth: number,
    viewportHeight: number,
    radius: number,
    buttonSize: number,
) => {
    const offset = radius + buttonSize / 2;
    const safeDistance = radius + EDGE_MARGIN;

    return {
        left: safeDistance - offset,
        right: viewportWidth - (safeDistance + offset),
        top: safeDistance + HEADER_HEIGHT - offset,
        bottom: viewportHeight - (safeDistance + offset),
    };
};

const findNearestAnchor = (
    x: number,
    y: number,
    viewportWidth: number,
    viewportHeight: number,
    allowedAnchors: AllowedDockAnchor[],
    radius: number,
    buttonSize: number,
): AllowedDockAnchor => {
    let nearestAnchor: AllowedDockAnchor = 'bottom-center';
    let minDistance = Infinity;

    for (const anchor of allowedAnchors) {
        const anchorPos = getAnchorPosition(anchor, viewportWidth, viewportHeight, radius, buttonSize);
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

    // =========================================================================
    // MOTION VALUES
    // =========================================================================

    const motionX = useMotionValue(0);
    const motionY = useMotionValue(0);

    // =========================================================================
    // STATE
    // =========================================================================

    const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
    const [isDragging, setIsDragging] = useState(false);
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

    const radius = isMobile ? DOCK_RADIUS_MOBILE : DOCK_RADIUS;
    const buttonSize = isMobile ? BUTTON_SIZE_MOBILE : BUTTON_SIZE;

    const dragConstraints = useMemo(
        () => calculateConstraints(viewportSize.width, viewportSize.height, radius, buttonSize),
        [viewportSize, radius, buttonSize],
    );

    // =========================================================================
    // SNAP TO ANCHOR
    // =========================================================================

    const snapToAnchor = useCallback(
        (anchor: AllowedDockAnchor, shouldAnimate = true) => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const isMobileView = vw < MOBILE_BREAKPOINT;
            const currentRadius = isMobileView ? DOCK_RADIUS_MOBILE : DOCK_RADIUS;
            const currentButtonSize = isMobileView ? BUTTON_SIZE_MOBILE : BUTTON_SIZE;

            const targetPos = getAnchorPosition(anchor, vw, vh, currentRadius, currentButtonSize);

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
            setIsDragging(true);
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
            setIsDragging(false);
            dragStartPos.current = null;

            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const isMobileView = vw < MOBILE_BREAKPOINT;
            const currentRadius = isMobileView ? DOCK_RADIUS_MOBILE : DOCK_RADIUS;
            const currentButtonSize = isMobileView ? BUTTON_SIZE_MOBILE : BUTTON_SIZE;

            if (isMobile) {
                const currentY = motionY.get();
                const centerY = vh / 2;
                const newPosition = currentY < centerY ? 'top' : 'bottom';

                setMobileDockPosition(newPosition);

                const anchor = newPosition === 'bottom' ? 'bottom-center' : 'top-center';
                const targetPos = getAnchorPosition(anchor, vw, vh, currentRadius, currentButtonSize);

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
                currentRadius,
                currentButtonSize,
            );

            setCurrentAnchor(nearestAnchor);

            const snapPos = getAnchorPosition(nearestAnchor, vw, vh, currentRadius, currentButtonSize);

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

    return (
        <motion.div
            className={`${styles.dockWrapper} ${isDragging ? styles.dragging : ''}`}
            drag={isMobile ? 'y' : true}
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={dragConstraints}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{ x: motionX, y: motionY }}
        >
            {/* Center Button */}
            <CentralTrigger
                isExpanded={isExpanded}
                activeTool={preferences.defaultTool}
                onClick={handleToggleExpand}
            />

            {/* Radial Ring with Tools */}
            <AnimatePresence>
                {isExpanded && (
                    <RadialRing
                        radius={isMobile ? DOCK_RADIUS_MOBILE : DOCK_RADIUS}
                        currentTool={preferences.defaultTool}
                        onToolSelect={handleToolSelect}
                        onOpenSatellite={handleOpenSatellite}
                    />
                )}
            </AnimatePresence>

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
