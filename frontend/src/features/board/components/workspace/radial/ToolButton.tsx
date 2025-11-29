import { TOOLS } from 'features/board/constants/BoardConstants';
import { motion } from 'framer-motion';
import {
    Brush,
    ChevronDown,
    Circle,
    Eraser,
    Minus,
    Palette,
    Pipette,
    Settings,
    Square,
    Type,
} from 'lucide-react';
import React from 'react';
import type { Tool } from 'shared/types/CommonTypes';

import type { RadialPosition } from './utils/radialPositioning';

import styles from './RadialDock.module.scss';

/**
 * Props for the ToolButton component.
 */
interface ToolButtonProps {
    /** Tool identifier or satellite trigger name */
    tool: Tool | string;
    /** Calculated position on the radial ring */
    position: RadialPosition;
    /** Whether this tool is currently active */
    isActive: boolean;
    /** Click handler */
    onClick: () => void;
    /** Optional label for accessibility */
    label?: string;
}

/**
 * Individual tool button on the radial ring.
 * 
 * Renders a single tool with its icon, positioned at the calculated
 * radial coordinates. Supports both direct tools (Pen, Eraser) and
 * satellite triggers (Shapes, Colors).
 * 
 * Features:
 * - Radial positioning via Framer Motion
 * - Spring animation on mount/unmount
 * - Hover and tap feedback
 * - Active state styling
 * - Glass morphism design
 * 
 * @param tool - Tool identifier
 * @param position - Radial position (x, y, angle)
 * @param isActive - Active state
 * @param onClick - Click handler
 * @param label - Accessibility label
 */
export const ToolButton: React.FC<ToolButtonProps> = ({
    tool,
    position,
    isActive,
    onClick,
    label,
}) => {
    /**
     * Get the appropriate icon for the tool.
     * Includes both direct tools and satellite triggers.
     */
    const getIcon = () => {
        const iconSize = 20;

        switch (tool) {
            case TOOLS.BRUSH:
                return <Brush size={iconSize} />;
            case TOOLS.ERASER:
                return <Eraser size={iconSize} />;
            case TOOLS.TEXT:
                return <Type size={iconSize} />;
            case TOOLS.COLOR_PICKER:
                return <Pipette size={iconSize} />;

            // Satellite triggers
            case 'shapes':
                return (
                    <div className={styles.iconWithChevron}>
                        <Square size={iconSize} />
                        <ChevronDown size={12} className={styles.chevron} />
                    </div>
                );
            case 'lines':
                return (
                    <div className={styles.iconWithChevron}>
                        <Minus size={iconSize} />
                        <ChevronDown size={12} className={styles.chevron} />
                    </div>
                );
            case 'colorPalette':
                return <Palette size={iconSize} />;
            case 'strokeProps':
                return <Settings size={iconSize} />;

            // Shape tools (if directly selected)
            case TOOLS.RECTANGLE:
            case TOOLS.SQUARE:
                return <Square size={iconSize} />;
            case TOOLS.CIRCLE:
                return <Circle size={iconSize} />;

            default:
                return <Brush size={iconSize} />;
        }
    };

    /**
     * Animation variants for the tool button.
     * Staggered by parent RadialRing component.
     */
    const itemVariants = {
        hidden: { scale: 0, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: 'spring' as const,
                stiffness: 300,
                damping: 25,
            },
        },
    };

    return (
        <motion.button
            className={`${styles.toolButton} ${isActive ? styles.active : ''}`}
            variants={itemVariants}
            style={{
                x: position.x,
                y: position.y,
            }}
            onClick={onClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={label || String(tool)}
            aria-pressed={isActive}
        >
            {getIcon()}
        </motion.button>
    );
};
