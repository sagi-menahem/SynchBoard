/**
 * Client-side routing constants for the SynchBoard application.
 * Defines URL paths for navigation and includes both static routes and parameterized
 * route patterns with helper functions for generating dynamic URLs. Used by React Router
 * for navigation and route matching throughout the application.
 */

export const APP_ROUTES = {
  LANDING: '/',
  AUTH: '/', // All auth redirects now go to landing page (which has login/registration modal)
  AUTH_CALLBACK: '/auth/callback',
  AUTH_ERROR: '/auth/error',
  BOARD_LIST: '/boards',
  SETTINGS: '/settings',

  BOARD_DETAIL_PATTERN: '/board/:boardId',
  getBoardDetailRoute: (boardId: number | string) => `/board/${boardId}`,

  BOARD_DETAILS_PATTERN: '/board/:boardId/details',
  getBoardDetailsRoute: (boardId: number | string) => `/board/${boardId}/details`,
} as const;
