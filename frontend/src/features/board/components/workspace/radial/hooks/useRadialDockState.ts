import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useToolPreferences } from 'features/settings/ToolPreferencesProvider';
import type { Tool } from 'shared/types/CommonTypes';
import { isRTL } from 'shared/utils/rtlUtils';

import { RESIZE_DEBOUNCE_MS } from '../constants/RadialDockConstants';
import type { RadialDockActions, RadialDockState } from '../types/RadialDockTypes';
import { detectMobileDevice } from '../utils/MobileDetection';

interface UseRadialDockStateResult {
  state: RadialDockState;
  actions: RadialDockActions;
  preferences: ReturnType<typeof useToolPreferences>['preferences'];
  updateDockMinimized: (minimized: boolean) => Promise<void>;
}

/**
 * Hook that manages the core state of the RadialDock component.
 * Handles mobile detection, expansion state, satellite state, and tool preferences.
 */
export const useRadialDockState = (
  onSatelliteChange?: (satelliteType: string | null) => void,
): UseRadialDockStateResult => {
  const { preferences, updateTool, updateDockMinimized } = useToolPreferences();
  const { i18n } = useTranslation();
  const isRTLMode = isRTL(i18n.language);

  // Mobile detection state
  const [isMobile, setIsMobile] = useState(detectMobileDevice());

  // On mobile, always start collapsed regardless of saved preference
  const initialMobile = detectMobileDevice();
  const [isExpanded, setIsExpanded] = useState(
    initialMobile ? false : !preferences.isDockMinimized,
  );

  // Active satellite state
  const [activeSatellite, setActiveSatellite] = useState<string | null>(null);

  // Sync expansion state with preferences (desktop only)
  useEffect(() => {
    // On mobile, don't sync from preferences - always require manual open
    if (!isMobile) {
      setIsExpanded(!preferences.isDockMinimized);
    }
  }, [preferences.isDockMinimized, isMobile]);

  // Notify parent when satellite state changes
  useEffect(() => {
    onSatelliteChange?.(activeSatellite);
  }, [activeSatellite, onSatelliteChange]);

  // Viewport resize handler for mobile detection
  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);

      resizeTimeout = setTimeout(() => {
        const mobile = detectMobileDevice();
        setIsMobile(mobile);
      }, RESIZE_DEBOUNCE_MS);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, []);

  // Toggle body class for FloatingActions to respond on mobile
  useEffect(() => {
    if (isMobile && isExpanded) {
      document.body.classList.add('dock-expanded');
    } else {
      document.body.classList.remove('dock-expanded');
    }

    return () => {
      document.body.classList.remove('dock-expanded');
    };
  }, [isMobile, isExpanded]);

  // Action handlers
  const handleToggleExpand = useCallback(() => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    void updateDockMinimized(!newExpanded);

    if (!newExpanded) {
      setActiveSatellite(null);
    }
  }, [isExpanded, updateDockMinimized]);

  const handleToolSelect = useCallback(
    (tool: Tool) => {
      void updateTool(tool);
      setActiveSatellite(null);
      // Toolbar stays open until user explicitly closes it (via chevron or drag)
    },
    [updateTool],
  );

  const handleOpenSatellite = useCallback((satelliteType: string) => {
    setActiveSatellite((prev) => (prev === satelliteType ? null : satelliteType));
  }, []);

  const state: RadialDockState = {
    isMobile,
    isExpanded,
    activeSatellite,
    isDragging: false, // Will be overridden by useMobileDragGesture
    dragY: 0, // Will be overridden by useMobileDragGesture
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1200,
    isRTLMode,
  };

  const actions: RadialDockActions = {
    setIsExpanded,
    setActiveSatellite,
    handleToggleExpand,
    handleToolSelect,
    handleOpenSatellite,
  };

  return {
    state,
    actions,
    preferences,
    updateDockMinimized,
  };
};
