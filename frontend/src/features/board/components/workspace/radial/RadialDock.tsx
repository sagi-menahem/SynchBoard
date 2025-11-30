import { TOOLS } from 'features/board/constants/BoardConstants';
import { useToolPreferences } from 'features/settings/ToolPreferencesProvider';
import { AnimatePresence, motion } from 'framer-motion';
import { Brush, ChevronUp, Eraser, Minus, Palette, PenTool, Pipette, Square, Type } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import type { Tool } from 'shared/types/CommonTypes';

import styles from './RadialDock.module.scss';
import { SatelliteManager } from './SatelliteManager';


// =============================================================================
// CONSTANTS
// =============================================================================

const MOBILE_BREAKPOINT = 768;

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
    icon: React.ReactNode;
}

const DOCK_TOOLS: ToolItem[] = [
    { tool: TOOLS.BRUSH, type: 'direct', label: 'Brush', icon: <Brush size={20} /> },
    { tool: TOOLS.ERASER, type: 'direct', label: 'Eraser', icon: <Eraser size={20} /> },
    { tool: 'shapes', type: 'satellite', label: 'Shapes', icon: <Square size={20} /> },
    { tool: 'lines', type: 'satellite', label: 'Lines', icon: <Minus size={20} /> },
    { tool: TOOLS.TEXT, type: 'direct', label: 'Text', icon: <Type size={20} /> },
    { tool: TOOLS.COLOR_PICKER, type: 'direct', label: 'Color Picker', icon: <Pipette size={20} /> },
    { tool: 'strokeProps', type: 'satellite', label: 'Stroke Width', icon: <PenTool size={20} /> },
    { tool: 'colorPalette', type: 'satellite', label: 'Palette', icon: <Palette size={20} /> },
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
        },
        [updateTool],
    );

    const handleOpenSatellite = useCallback((satelliteType: string) => {
        setActiveSatellite((prev) => (prev === satelliteType ? null : satelliteType));
    }, []);

    // =========================================================================
    // RENDER
    // =========================================================================

    const activeToolIcon = React.useMemo(() => {
        const tool = DOCK_TOOLS.find(t => t.tool === preferences.defaultTool);
        return tool ? tool.icon : <Brush size={20} />;
    }, [preferences.defaultTool]);

    return (
        <>
            <div className={`${styles.fixedToolbar} ${isMobile ? styles.mobile : styles.desktop}`}>
                <AnimatePresence mode="wait">
                    {!isExpanded ? (
                        // COLLAPSED STATE - Small trigger button
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
                        {isMobile && <div className={styles.pullHandle} />}
                        <motion.div
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            {activeToolIcon}
                        </motion.div>
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
                                    const isActive = preferences.defaultTool === item.tool;
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
                                            {item.icon}
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
                                        const isActive = preferences.defaultTool === item.tool;
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
                                                {item.icon}
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
        />
        </>
    );
};

export default RadialDock;
