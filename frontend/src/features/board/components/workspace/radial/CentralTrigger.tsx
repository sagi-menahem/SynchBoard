import { TOOLS } from 'features/board/constants/BoardConstants';
import { motion } from 'framer-motion';
import { Brush, Eraser, Pipette, Square, Type, X } from 'lucide-react';
import React from 'react';
import type { Tool } from 'shared/types/CommonTypes';

import styles from './RadialDock.module.scss';

/**
 * Props for the CentralTrigger component.
 */
interface CentralTriggerProps {
    /** Whether the dock is currently expanded */
    isExpanded: boolean;
    /** Currently active drawing tool */
    activeTool: Tool;
    /** Click handler for expand/collapse */
    onClick: () => void;
}

/**
 * Central button component for the RadialDock.
 * 
 * Displays the active tool icon when collapsed, and a close icon when expanded.
 * Serves as the primary trigger for expanding/collapsing the radial menu.
 * 
 * Features:
 * - Icon morphing animation (tool icon ↔ close icon)
 * - Hover and tap feedback
 * - Glass morphism styling
 * - Accessible (ARIA labels)
 * 
 * @param isExpanded - Current expansion state
 * @param activeTool - Active tool to display icon for
 * @param onClick - Handler for click events
 */
export const CentralTrigger: React.FC<CentralTriggerProps> = ({
    isExpanded,
    activeTool,
    onClick,
}) => {
    /**
     * Get the appropriate icon component for the current state.
     * Shows close icon when expanded, tool icon when collapsed.
     */
    const getIcon = () => {
        if (isExpanded) {
            return <X size={24} />;
        }

        // Map tool to icon
        switch (activeTool) {
            case TOOLS.BRUSH:
                return <Brush size={24} />;
            case TOOLS.ERASER:
                return <Eraser size={24} />;
            case TOOLS.TEXT:
                return <Type size={24} />;
            case TOOLS.COLOR_PICKER:
                return <Pipette size={24} />;
            case TOOLS.RECTANGLE:
            case TOOLS.CIRCLE:
            case TOOLS.TRIANGLE:
            case TOOLS.STAR:
            case TOOLS.HEXAGON:
            case TOOLS.PENTAGON:
            case TOOLS.SQUARE:
                return <Square size={24} />;
            default:
                return <Brush size={24} />;
        }
    };

    return (
        <motion.button
            className={styles.centralTrigger}
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Close toolbar' : 'Open toolbar'}
        >
            {/* Icon with morph animation */}
            <motion.div
                key={isExpanded ? 'close' : activeTool}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                {getIcon()}
            </motion.div>
        </motion.button>
    );
};
