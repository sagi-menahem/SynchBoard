// File: frontend/src/constants/routes.constants.ts

/**
 * A central place for all application routes.
 * This prevents using hardcoded strings for links and navigation.
 */
export const APP_ROUTES = {
    // Static routes
    AUTH: '/',
    BOARD_LIST: '/boards',
    
    // Dynamic route pattern
    BOARD_DETAIL_PATTERN: '/board/:boardId',

    // Helper function to build a dynamic route safely
    getBoardDetailRoute: (boardId: number | string) => `/board/${boardId}`,
} as const;