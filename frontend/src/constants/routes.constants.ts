// File: frontend/src/constants/routes.constants.ts
export const APP_ROUTES = {
    AUTH: '/',
    BOARD_LIST: '/boards',
    SETTINGS: '/settings',

    BOARD_DETAIL_PATTERN: '/board/:boardId',
    getBoardDetailRoute: (boardId: number | string) => `/board/${boardId}`,

    BOARD_DETAILS_PATTERN: '/board/:boardId/details',
    getBoardDetailsRoute: (boardId: number | string) => `/board/${boardId}/details`,
} as const;
