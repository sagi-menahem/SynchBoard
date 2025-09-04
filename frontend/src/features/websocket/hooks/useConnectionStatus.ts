import { useEffect, useRef, useState } from 'react';

import { useSocket } from './useSocket';

/**
 * Connection status state object returned by useConnectionStatus hook.
 * Provides UI control flags and connection information for user feedback.
 */
export interface ConnectionStatusState {
  // Whether to display connection loss banner to inform user of connectivity issues
  shouldShowBanner: boolean;
  // Whether to disable real-time features that require WebSocket connectivity
  shouldBlockFunctionality: boolean;
  // Current WebSocket connection lifecycle state
  connectionState: 'disconnected' | 'connecting' | 'connected';
  // Boolean flag indicating if WebSocket is connected and ready for messaging
  isSocketConnected: boolean;
}

// Delay before showing disconnection banner to avoid flicker during reconnections
const BANNER_DELAY_MS = 5000;

/**
 * Custom hook that manages UI state based on WebSocket connection status.
 * Provides intelligent banner display logic with delays to prevent UI flicker
 * during connection transitions, and functionality blocking for disconnected states.
 * 
 * Key features:
 * - Delayed banner display (5 seconds) to avoid showing banner during brief disconnections
 * - Automatic banner hiding when connection is restored
 * - Functionality blocking recommendations for features requiring real-time connectivity
 * - Clean timeout management to prevent memory leaks
 * 
 * @returns Connection status state object with UI control flags and connection information
 */
export const useConnectionStatus = (): ConnectionStatusState => {
  const { connectionState, isSocketConnected } = useSocket();
  const [shouldShowBanner, setShouldShowBanner] = useState(false);
  // Ref to track banner display timeout and enable cleanup
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any existing timeout to prevent multiple timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (connectionState === 'connected') {
      setShouldShowBanner(false);
    } else if (connectionState === 'disconnected') {
      // Delay banner display to avoid showing during brief connection interruptions
      timeoutRef.current = setTimeout(() => {
        setShouldShowBanner(true);
      }, BANNER_DELAY_MS);
    } else {
      // Hide banner during connecting state
      setShouldShowBanner(false);
    }

    // Cleanup timeout on effect cleanup or dependency change
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
