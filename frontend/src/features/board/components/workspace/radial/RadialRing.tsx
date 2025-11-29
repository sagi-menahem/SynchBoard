import { TOOLS } from 'features/board/constants/BoardConstants';
import { motion } from 'framer-motion';
import React from 'react';
import type { Tool } from 'shared/types/CommonTypes';

import { ToolButton } from './ToolButton';
import { calculateRadialPosition } from './utils/radialPositioning';

import styles from './RadialDock.module.scss';

/**
 * Props for the RadialRing component.
 */
interface RadialRingProps {
    /** Radius of the ring in pixels */
    radius: number;
    /** Currently active tool */
    currentTool: Tool;
    /** Handler for direct tool selection */
    onToolSelect: (tool: Tool) => void;
    /** Handler for opening satellite menus */
    onOpenSatellite: (type: string) => void;
}

/**
 * Configuration for tools on the radial ring.
 * Defines the 8 positions around the circle.
 */
const RING_TOOLS = [
    { tool: TOOLS.BRUSH, type: 'direct', label: 'Brush' },
    { tool: TOOLS.ERASER, type: 'direct', label: 'Eraser' },
    { tool: 'shapes', type: 'satellite', label: 'Shapes' },
    { tool: 'lines', type: 'satellite', label: 'Lines' },
    { tool: TOOLS.TEXT, type: 'direct', label: 'Text' },
    { tool: TOOLS.COLOR_PICKER, type: 'direct', label: 'Color Picker' },
    { tool: 'strokeProps', type: 'satellite', label: 'Stroke Properties' },
    { tool: 'colorPalette', type: 'satellite', label: 'Color Palette' },
] as const;

/**
 * Radial ring component containing all tool buttons.
 * 
 * Arranges 8 tools in a perfect circle around the center button.
 * Uses trigonometry to calculate positions and Framer Motion for
 * staggered entrance/exit animations.
 * 
 * Features:
 * - 8 evenly-spaced tools (45° apart)
 * - Staggered spring animation
 * - Supports both direct tools and satellite triggers
 * - Responsive radius
 * 
 * @param radius - Ring radius in pixels
 * @param currentTool - Active tool for highlighting
 * @param onToolSelect - Handler for direct tool clicks
 * @param onOpenSatellite - Handler for satellite trigger clicks
 */
export const RadialRing: React.FC<RadialRingProps> = ({
    radius,
    currentTool,
    onToolSelect,
    onOpenSatellite,
}) => {
    /**
     * Container animation variants.
     * Staggers children by 30ms for smooth cascade effect.
     */
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.03,
            },
        },
    };

    return (
        <motion.div
            className={styles.radialRing}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
        >
            {RING_TOOLS.map((item, index) => {
                // Calculate position using trigonometry
                const position = calculateRadialPosition(
                    index,
                    RING_TOOLS.length,
                    radius
                );

                // Determine if this tool is active
                const isActive = currentTool === item.tool;

                // Handle click based on tool type
                const handleClick = () => {
                    if (item.type === 'direct') {
                        onToolSelect(item.tool as Tool);
                    } else {
                        onOpenSatellite(item.tool);
                    }
                };

                return (
                    <ToolButton
                        key={item.tool}
                        tool={item.tool}
                        position={position}
                        isActive={isActive}
                        onClick={handleClick}
                        label={item.label}
                    />
                );
            })}
        </motion.div>
    );
};
