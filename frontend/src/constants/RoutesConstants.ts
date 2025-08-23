export const APP_ROUTES = {
  AUTH: '/',
  AUTH_CALLBACK: '/auth/callback',
  AUTH_ERROR: '/auth/error',
  BOARD_LIST: '/boards',
  SETTINGS: '/settings',

  BOARD_DETAIL_PATTERN: '/board/:boardId',
  getBoardDetailRoute: (boardId: number | string) => `/board/${boardId}`,

  BOARD_DETAILS_PATTERN: '/board/:boardId/details',
  getBoardDetailsRoute: (boardId: number | string) => `/board/${boardId}/details`,
} as const;
