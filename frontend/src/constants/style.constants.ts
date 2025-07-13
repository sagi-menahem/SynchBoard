// File: frontend/src/constants/style.constants.ts

/**
 * A centralized color palette for consistent styling across the app.
 */
export const COLORS = {
    // General UI colors
    PRIMARY_LINK: '#8186ff',
    
    // Semantic colors for user feedback
    SUCCESS: 'green',
    ERROR: 'red',
    ADMIN_ACCENT: '#4ade80',

    // Component-specific colors
    CANVAS_BACKGROUND: '#222', // Same as CANVAS_CONFIG.BACKGROUND_COLOR but for general styling
} as const;