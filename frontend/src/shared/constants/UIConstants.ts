/**
 * User interface layout and styling constants for the SynchBoard application.
 * Defines precise pixel measurements, spacing values, dimensions, and tolerances used
 * across various UI components including toolbars, modals, canvas interactions, and layout elements.
 * These constants ensure consistent visual spacing and behavior throughout the application.
 */

export const UI_CONSTANTS = {
  AUTH_MODAL_MAX_WIDTH: '400px',

  TOOLBAR_SIZE_CONTROL_MIN_WIDTH: '120px',
  TOOLBAR_SIZE_CONTROL_HEIGHT: '36px',
  TOOLBAR_SIZE_CONTROL_PADDING: '0 8px',
  TOOLBAR_SIZE_CONTROL_BORDER_RADIUS: '6px',

  TOOLBAR_GAP: '8px',
  TOOLBAR_PADDING_RIGHT: '8px',
  SEPARATOR_WIDTH: '1px',

  BOARD_LOADING_PADDING: '2rem',
  CANVAS_SETTINGS_MARGIN_TOP: '0.5rem',

  ROOT_REDIRECT_FONT_SIZE: '1.2rem',
  EMAIL_VERIFICATION_SMALL_FONT_SIZE: '0.875rem',
  EMAIL_VERIFICATION_MARGIN: '0.75rem',
  EMAIL_VERIFICATION_SMALL_MARGIN: '0.25rem',
  EMAIL_VERIFICATION_PADDING_TOP: '1rem',

  TOAST_BORDER_RADIUS: '8px',
  TOAST_PADDING: '12px 16px',

  CANVAS_HIT_DETECTION_MIN_TOLERANCE: 3,

  BANNER_HEIGHT_HIDDEN: '0px',
} as const;
