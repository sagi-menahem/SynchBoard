import React, { useEffect, useRef, useState } from 'react';

import { useSocket } from 'hooks/common';

import styles from './ConnectionStatusBanner.module.css';

interface ConnectionStatusBannerProps {
  onHeightChange?: (height: number) => void;
}

export const ConnectionStatusBanner: React.FC<ConnectionStatusBannerProps> = ({ onHeightChange }) => {
  const { connectionState } = useSocket();
  const [shouldShowBanner, setShouldShowBanner] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (connectionState === 'connected') {
      // Hide banner immediately when connected
      setShouldShowBanner(false);
    } else if (connectionState === 'disconnected') {
      // Start timeout to show banner after 10 seconds of disconnection
      timeoutRef.current = setTimeout(() => {
        setShouldShowBanner(true);
      }, 10000); // 10 seconds
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [connectionState]);

  const showBanner = shouldShowBanner && connectionState === 'disconnected';

  // Height detection with ResizeObserver and direct measurement
  useEffect(() => {
    if (!bannerRef.current) return;

    const measureAndNotify = () => {
      if (bannerRef.current) {
        const rect = bannerRef.current.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(bannerRef.current);
        const height = rect.height;
        const computedHeight = parseFloat(computedStyle.height);
        
        // Use the larger of rect.height or computed height
        const finalHeight = Math.max(height, computedHeight);
        
        if (onHeightChange && finalHeight > 0) {
          onHeightChange(finalHeight);
        }
        
        document.documentElement.style.setProperty('--banner-height', `${finalHeight}px`);
      }
    };

    // Immediate measurement
    measureAndNotify();

    // ResizeObserver as backup
    const resizeObserver = new ResizeObserver((entries) => {
      const height = entries[0].contentRect.height;
      const borderBoxHeight = entries[0].borderBoxSize?.[0]?.blockSize || height;
      
      const finalHeight = Math.max(height, borderBoxHeight);
      
      if (onHeightChange && finalHeight > 0) {
        onHeightChange(finalHeight);
      }
      
      document.documentElement.style.setProperty('--banner-height', `${finalHeight}px`);
    });

    resizeObserver.observe(bannerRef.current);

    // Also measure on window resize
    const handleResize = () => {
      setTimeout(measureAndNotify, 100); // Small delay to let layout settle
    };
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      document.documentElement.style.setProperty('--banner-height', '0px');
    };
  }, [onHeightChange]);

  // Update height when banner visibility changes
  useEffect(() => {
    if (!showBanner) {
      if (onHeightChange) {
        onHeightChange(0);
      }
      document.documentElement.style.setProperty('--banner-height', '0px');
    } else {
      // Multiple measurement attempts with increasing delays
      const measureWithRetry = (attempt = 1, maxAttempts = 5) => {
        if (!bannerRef.current) return;
        
        const rect = bannerRef.current.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(bannerRef.current);
        const height = rect.height;
        const computedHeight = parseFloat(computedStyle.height);
        const offsetHeight = bannerRef.current.offsetHeight;
        
        const finalHeight = Math.max(height, computedHeight, offsetHeight);
        
        if (finalHeight > 0) {
          if (onHeightChange) {
            onHeightChange(finalHeight);
          }
          document.documentElement.style.setProperty('--banner-height', `${finalHeight}px`);
        } else if (attempt < maxAttempts) {
          setTimeout(() => measureWithRetry(attempt + 1, maxAttempts), attempt * 50);
        } else {
          // Fallback: estimate height based on typical banner size
          const fallbackHeight = 60;
          if (onHeightChange) {
            onHeightChange(fallbackHeight);
          }
          document.documentElement.style.setProperty('--banner-height', `${fallbackHeight}px`);
        }
      };
      
      measureWithRetry();
    }
  }, [showBanner, onHeightChange]);


  if (!showBanner) {
    return null;
  }

  return (
    <div ref={bannerRef} className={`${styles.banner} ${styles.disconnected}`}>
      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">
          ⚠️
        </span>
        <span className={styles.message}>
          Connection lost - limited functionality
        </span>
      </div>
    </div>
  );
};