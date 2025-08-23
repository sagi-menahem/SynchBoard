import { useEffect, useRef, useState } from 'react';

import { useSocket } from './useSocket';

export interface ConnectionStatusState {
  shouldShowBanner: boolean;
  shouldBlockFunctionality: boolean;
  connectionState: 'disconnected' | 'connecting' | 'connected';
  isSocketConnected: boolean;
}

const BANNER_DELAY_MS = 5000;

export const useConnectionStatus = (): ConnectionStatusState => {
  const { connectionState, isSocketConnected } = useSocket();
  const [shouldShowBanner, setShouldShowBanner] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (connectionState === 'connected') {
      setShouldShowBanner(false);
    } else if (connectionState === 'disconnected') {
      timeoutRef.current = setTimeout(() => {
        setShouldShowBanner(true);
      }, BANNER_DELAY_MS);
    } else {
      setShouldShowBanner(false);
    }

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