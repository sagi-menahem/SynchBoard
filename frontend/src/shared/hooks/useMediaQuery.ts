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
 * Device type classification
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Multi-layered device detection using User Agent, Pointer Type, and Width.
 * Handles edge cases like touchscreen laptops, small desktop screens, and tablets.
 *
 * Detection priority:
 * 1. User Agent (most reliable for phones/tablets)
 * 2. Pointer Type (coarse = touch, fine = mouse/trackpad)
 * 3. Width fallback (legacy detection)
 *
 * @returns DeviceType - 'mobile' (phone), 'tablet' (iPad/Android tablet), or 'desktop'
 */
const detectDeviceType = (): DeviceType => {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  const width = window.innerWidth;
  const userAgent = navigator.userAgent;

  // 1. Explicit phone detection (highest priority)
  // Phones should always use mobile UI regardless of orientation
  if (/iPhone|iPod|Android.*Mobile/i.test(userAgent)) {
    return 'mobile';
  }

  // 2. Explicit tablet detection
  // iPad and Android tablets (but not phones)
  if (/iPad|Android(?!.*Mobile)/i.test(userAgent)) {
    // Large tablets (≥1024px) can use desktop-like UI
    // Smaller tablets use mobile UI for better UX
    return width < 1024 ? 'mobile' : 'tablet';
  }

  // 3. Pointer type detection (modern approach)
  // Helps distinguish touchscreen laptops from actual mobile devices
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  // Device with ONLY coarse pointer (touch) and small screen = mobile
  if (isCoarsePointer && !isFinePointer && width < 1024) {
    return 'mobile';
  }

  // Device with fine pointer (mouse/trackpad) = desktop, even if touchscreen
  if (isFinePointer) {
    return 'desktop';
  }

  // 4. Fallback to width-based detection (legacy browsers)
  return width < 768 ? 'mobile' : 'desktop';
};

/**
 * Detects if the device is mobile (phone or small tablet).
 * Compatible with existing code expecting boolean.
 *
 * @returns boolean indicating if the device should use mobile UI
 */
const detectMobileDevice = (): boolean => {
  const deviceType = detectDeviceType();
  return deviceType === 'mobile';
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

/**
 * Hook to detect and track device type (mobile/tablet/desktop).
 * Provides granular device classification for responsive behavior.
 *
 * @returns DeviceType - 'mobile', 'tablet', or 'desktop'
 */
export const useDeviceType = (): DeviceType => {
  const [deviceType, setDeviceType] = useState<DeviceType>(() => detectDeviceType());

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(detectDeviceType());
    };

    // Set initial value
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return deviceType;
};

/**
 * Hook to detect tablet viewport (768px-1023px width).
 * @returns boolean indicating if screen width matches tablet breakpoint
 */
export const useIsTablet = (): boolean =>
  useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

/**
 * Hook to detect desktop viewport (1024px+ width).
 * @returns boolean indicating if screen width matches desktop breakpoint
 */
export const useIsDesktop = (): boolean => useMediaQuery('(min-width: 1024px)');
