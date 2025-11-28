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
 * Predefined breakpoint hooks for common responsive scenarios.
 * Based on project design tokens: sm=480px, md=768px, lg=1024px, xl=1280px
 */
export const useIsMobile = (): boolean => useMediaQuery('(max-width: 767px)');
export const useIsTablet = (): boolean =>
  useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
export const useIsDesktop = (): boolean => useMediaQuery('(min-width: 1024px)');
