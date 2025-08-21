import { useEffect, useRef, useState } from 'react';

import { useSocket } from './useSocket';

export interface ConnectionStatusState {
  /**
   * Whether to show the connection status banner
   */
  shouldShowBanner: boolean;
  
  /**
   * Whether functionality should be blocked (drawing, chat, etc.)
   */
  shouldBlockFunctionality: boolean;
  
  /**
   * Current connection state for reference
   */
  connectionState: 'disconnected' | 'connecting' | 'connected';
  
  /**
   * Raw socket connection status
   */
  isSocketConnected: boolean;
}

const BANNER_DELAY_MS = 10000; // 10 seconds delay before showing banner

/**
 * Centralized connection status hook that provides a single source of truth
 * for both banner display and functionality blocking.
 * 
 * - Functionality is blocked immediately when disconnected
 * - Banner appears after a delay to avoid flashing on brief disconnections
 * - Both use the same underlying connection state for consistency
 */
export const useConnectionStatus = (): ConnectionStatusState => {
  const { connectionState, isSocketConnected } = useSocket();
  const [shouldShowBanner, setShouldShowBanner] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (connectionState === 'connected') {
      // Immediately hide banner when connected
      setShouldShowBanner(false);
    } else if (connectionState === 'disconnected') {
      // Show banner after delay when disconnected
      timeoutRef.current = setTimeout(() => {
        setShouldShowBanner(true);
      }, BANNER_DELAY_MS);
    } else {
      // Don't show banner when connecting
      setShouldShowBanner(false);
    }

    // Cleanup timeout on unmount or state change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [connectionState]);

  return {
    shouldShowBanner: shouldShowBanner && connectionState === 'disconnected',
    shouldBlockFunctionality: !isSocketConnected,
    connectionState,
    isSocketConnected,
  };
};