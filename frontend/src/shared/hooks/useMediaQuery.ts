import { useCallback, useEffect, useState } from 'react';

/**
 * Custom hook for responsive design that tracks whether a CSS media query matches.
 * Uses window.matchMedia for efficient, event-driven media query detection.
 *
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the media query currently matches
 */
export const useMediaQuery = (query: string): boolean => {
  const getMatches = useCallback((mediaQuery: string): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(mediaQuery).matches;
  }, []);

  const [matches, setMatches] = useState<boolean>(() => getMatches(query));

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set initial value
    setMatches(mediaQueryList.matches);

    // Modern browsers
    mediaQueryList.addEventListener('change', handleChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};

/**
 * Detects if the device is mobile based on device characteristics,
 * not just viewport width. This ensures phones stay in mobile mode
 * even when rotated to landscape orientation.
 * 
 * @returns boolean indicating if the device is mobile
 */
const detectMobileDevice = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check for mobile user agent
  const isMobileUserAgent = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Check for touch capability
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // If it's a mobile device (phone/tablet), always use mobile UI
  // Otherwise, fall back to width check for desktop responsiveness
  return isMobileUserAgent || (hasTouchScreen && window.innerWidth < 1024);
};

/**
 * Predefined breakpoint hooks for common responsive scenarios.
 * Based on project design tokens: sm=480px, md=768px, lg=1024px, xl=1280px
 * 
 * useIsMobile now uses device detection instead of width-only to handle
 * mobile landscape orientation properly.
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(() => detectMobileDevice());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(detectMobileDevice());
    };

    // Set initial value
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
};

export const useIsTablet = (): boolean =>
  useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
export const useIsDesktop = (): boolean => useMediaQuery('(min-width: 1024px)');
