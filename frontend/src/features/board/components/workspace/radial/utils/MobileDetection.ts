import { MOBILE_BREAKPOINT } from '../constants/RadialDockConstants';

/**
 * Detects if the device is mobile based on device characteristics,
 * not just viewport width. This ensures phones stay in mobile mode
 * even when rotated to landscape orientation.
 */
export const detectMobileDevice = (): boolean => {
  // Check for mobile user agent
  const isMobileUserAgent = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Check for touch capability
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // If it's a mobile device (phone/tablet), always use mobile UI
  // Otherwise, fall back to width check for desktop responsiveness
  return isMobileUserAgent || (hasTouchScreen && window.innerWidth < MOBILE_BREAKPOINT);
};
