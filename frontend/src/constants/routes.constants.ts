// File: frontend/src/constants/routes.constants.ts
export const APP_ROUTES = {
    AUTH: '/',
    BOARD_LIST: '/boards',
    
    BOARD_DETAIL_PATTERN: '/board/:boardId',

    getBoardDetailRoute: (boardId: number | string) => `/board/${boardId}`,
} as const;