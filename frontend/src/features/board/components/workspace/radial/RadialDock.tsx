import { TOOLS } from 'features/board/constants/BoardConstants';
import { useToolPreferences } from 'features/settings/ToolPreferencesProvider';
import { AnimatePresence, motion } from 'framer-motion';
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
    Type
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Tool } from 'shared/types/CommonTypes';

import styles from './RadialDock.module.scss';
import { SatelliteManager } from './SatelliteManager';


// =============================================================================
// CONSTANTS
// =============================================================================

const MOBILE_BREAKPOINT = 768;

// Shape tools that should trigger shapes satellite active state
const SHAPE_TOOLS = [TOOLS.SQUARE, TOOLS.CIRCLE, TOOLS.TRIANGLE, TOOLS.PENTAGON, TOOLS.HEXAGON, TOOLS.STAR] as const;

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
        return SHAPE_TOOLS.includes(currentTool as typeof SHAPE_TOOLS[number]);
    }
    if (satelliteType === 'lines') {
        return LINE_TOOLS.includes(currentTool as typeof LINE_TOOLS[number]);
    }
    return false;
};

// =============================================================================
// TYPES
// =============================================================================

interface RadialDockProps {
    /** Callback when satellite state changes (for coordinating with FloatingActions on mobile) */
    onSatelliteChange?: (satelliteType: string | null) => void;
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

export const RadialDock: React.FC<RadialDockProps> = ({ onSatelliteChange }) => {
    const {
        preferences,
        updateTool,
        updateDockMinimized,
    } = useToolPreferences();

    // =========================================================================
    // STATE
    // =========================================================================

    const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
    const [isExpanded, setIsExpanded] = useState(!preferences.isDockMinimized);
    const [activeSatellite, setActiveSatellite] = useState<string | null>(null);

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
                const newWidth = window.innerWidth;
                const mobile = newWidth < MOBILE_BREAKPOINT;
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
    // RENDER HELPERS
    // =========================================================================

    const getToolIcon = useCallback((item: ToolItem, size = 20): React.ReactNode => {
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
    }, [preferences.defaultTool, preferences.defaultStrokeColor]);

    const isToolActive = useCallback((item: ToolItem): boolean => {
        if (item.type === 'direct') {
            return preferences.defaultTool === item.tool;
        }
        // For satellite buttons, check if current tool belongs to that category
        return isSatelliteActive(item.tool as string, preferences.defaultTool);
    }, [preferences.defaultTool]);

    // =========================================================================
    // RENDER
    // =========================================================================

    const activeToolIcon = useMemo(() => {
        // Find the active tool in DOCK_TOOLS
        const directTool = DOCK_TOOLS.find(t => t.type === 'direct' && t.tool === preferences.defaultTool);
        if (directTool) {
            return getToolIcon(directTool, 20);
        }

        // Check if it's a shape tool
        if (SHAPE_TOOLS.includes(preferences.defaultTool as typeof SHAPE_TOOLS[number])) {
            return getShapeIcon(preferences.defaultTool, 20);
        }

        // Check if it's a line tool
        if (LINE_TOOLS.includes(preferences.defaultTool as typeof LINE_TOOLS[number])) {
            return getLineIcon(preferences.defaultTool, 20);
        }

        // Default fallback
        return <Brush size={20} />;
    }, [preferences.defaultTool, getToolIcon]);

    return (
        <>
            <div className={`${styles.fixedToolbar} ${isMobile ? styles.mobile : styles.desktop}`}>
                <AnimatePresence mode="wait">
                    {!isExpanded ? (
                        // COLLAPSED STATE - Small trigger button with color indicator
                        <motion.button
                            key="collapsed-trigger"
                            className={styles.collapsedTrigger}
                            onClick={handleToggleExpand}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ 
                                type: "spring", 
                                stiffness: 300, 
                                damping: 25
                            }}
                        >
                            {isMobile && (
                                <div 
                                    className={styles.pullHandle} 
                                    style={{ 
                                        backgroundColor: preferences.defaultTool === TOOLS.ERASER 
                                            ? 'rgba(0, 0, 0, 0.3)' // Neutral gray for eraser
                                            : preferences.defaultStrokeColor 
                                    }}
                                />
                            )}
                            <motion.div
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                {activeToolIcon}
                            </motion.div>
                            {!isMobile && preferences.defaultTool !== TOOLS.ERASER && (
                                <div 
                                    className={styles.collapsedColorIndicator}
                                    style={{ backgroundColor: preferences.defaultStrokeColor }}
                                />
                            )}
                        </motion.button>
                ) : (
                    // EXPANDED STATE - Full toolbar
                    <motion.div
                        key="expanded-toolbar"
                        className={styles.expandedToolbar}
                        initial={isMobile ? 
                            { y: "100%" } : 
                            { width: 56, opacity: 0 }
                        }
                        animate={isMobile ? 
                            { y: 0 } : 
                            { width: "auto", opacity: 1 }
                        }
                        exit={isMobile ? 
                            { y: "100%" } : 
                            { width: 56, opacity: 0 }
                        }
                        transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 30,
                            width: { duration: 0.3 },
                            opacity: { duration: 0.2 }
                        }}
                    >
                        {/* Desktop: Single row with all tools */}
                        {!isMobile && (
                            <motion.div 
                                className={styles.toolsRow}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.15, duration: 0.2 }}
                            >
                                {DOCK_TOOLS.map((item) => {
                                    const isActive = isToolActive(item);
                                    return (
                                        <button
                                            key={item.label}
                                            className={`${styles.toolButton} ${isActive ? styles.active : ''}`}
                                            onClick={() => item.type === 'direct' 
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
                        )}

                        {/* Mobile: Grid layout */}
                        {isMobile && (
                            <>
                                {/* Close button - positioned at top center on mobile */}
                                <button
                                    className={styles.closeButton}
                                    onClick={handleToggleExpand}
                                    aria-label="Close toolbar"
                                >
                                    <ChevronUp size={20} className={styles.closeIcon} />
                                </button>
                                
                                <div className={styles.toolsGrid}>
                                    {DOCK_TOOLS.map((item) => {
                                        const isActive = isToolActive(item);
                                        return (
                                            <button
                                                key={item.label}
                                                className={`${styles.toolButton} ${isActive ? styles.active : ''}`}
                                                onClick={() => item.type === 'direct' 
                                                    ? handleToolSelect(item.tool as Tool) 
                                                    : handleOpenSatellite(item.tool as string)
                                                }
                                                title={item.label}
                                            >
                                                {getToolIcon(item, 20)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
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
