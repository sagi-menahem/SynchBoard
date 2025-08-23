export const APP_ROUTES = {
  AUTH: '/',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  BOARD_LIST: '/boards',
  SETTINGS: '/settings',

  BOARD_DETAIL_PATTERN: '/board/:boardId',
  getBoardDetailRoute: (boardId: number | string) => `/board/${boardId}`,

  BOARD_DETAILS_PATTERN: '/board/:boardId/details',
  getBoardDetailsRoute: (boardId: number | string) => `/board/${boardId}/details`,
} as const;
