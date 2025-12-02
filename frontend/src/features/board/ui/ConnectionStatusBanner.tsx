import { useAuth } from 'features/auth/hooks';
import { useConnectionStatus } from 'features/websocket/hooks';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TIMING_CONSTANTS } from 'shared/constants/TimingConstants';

import styles from './ConnectionStatusBanner.module.scss';

interface ConnectionStatusBannerProps {
  onHeightChange?: (height: number) => void;
}

/**
 * Connection status banner component that displays network connectivity warnings.
 * This component monitors WebSocket connection status and displays a fixed warning banner
 * when the connection is lost. It automatically manages its height measurements and updates
 * CSS custom properties for layout adjustment, ensuring other page elements can properly
 * account for the banner's presence. The banner is only shown to authenticated users.
 *
 * @param onHeightChange - Optional callback fired when banner height changes for external layout adjustments
 */
export const ConnectionStatusBanner: React.FC<ConnectionStatusBannerProps> = ({
  onHeightChange,
}) => {
  const { t } = useTranslation('common');
  const { token } = useAuth();
  const { shouldShowBanner } = useConnectionStatus();
  const bannerRef = useRef<HTMLDivElement>(null);

  // Set up height measurement and CSS variable management
  useEffect(() => {
    if (!bannerRef.current) {
      return;
    }

    const measureAndNotify = () => {
      if (bannerRef.current) {
        const rect = bannerRef.current.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(bannerRef.current);
        const height = rect.height;
        const computedHeight = parseFloat(computedStyle.height);

        // Use the maximum height value for accurate layout calculations
        const finalHeight = Math.max(height, computedHeight);

        if (onHeightChange && finalHeight > 0) {
          onHeightChange(finalHeight);
        }

        document.documentElement.style.setProperty('--banner-height', `${finalHeight}px`);
      }
    };

    measureAndNotify();

    const resizeObserver = new ResizeObserver((entries) => {
      const height = entries[0].contentRect.height;
      const borderBoxHeight = entries[0].borderBoxSize?.[0]?.blockSize ?? height;

      const finalHeight = Math.max(height, borderBoxHeight);

      if (onHeightChange && finalHeight > 0) {
        onHeightChange(finalHeight);
      }

      document.documentElement.style.setProperty('--banner-height', `${finalHeight}px`);
    });

    resizeObserver.observe(bannerRef.current);

    const handleResize = () => {
      setTimeout(measureAndNotify, TIMING_CONSTANTS.CONNECTION_STATUS_MEASUREMENT_DELAY);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      document.documentElement.style.setProperty('--banner-height', '0px');
    };
  }, [onHeightChange]);

  // Handle banner visibility and height updates based on connection state
  useEffect(() => {
    if (!token || !shouldShowBanner) {
      if (onHeightChange) {
        onHeightChange(0);
      }
      document.documentElement.style.setProperty('--banner-height', '0px');
    } else {
      // Retry mechanism for accurate height measurement after banner becomes visible
      const measureWithRetry = (attempt = 1, maxAttempts = 5) => {
        if (!bannerRef.current) {
          return;
        }

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
          // Retry with increasing delay
          setTimeout(() => measureWithRetry(attempt + 1, maxAttempts), attempt * 50);
        } else {
          // Use fallback height if measurement fails after all retries
          const fallbackHeight = 60;
          if (onHeightChange) {
            onHeightChange(fallbackHeight);
          }
          document.documentElement.style.setProperty('--banner-height', `${fallbackHeight}px`);
        }
      };

      measureWithRetry();
    }
  }, [token, shouldShowBanner, onHeightChange]);

  if (!token || !shouldShowBanner) {
    return null;
  }

  return (
    <div ref={bannerRef} className={`${styles.banner} ${styles.disconnected}`}>
      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">
          ⚠️
        </span>
        <span className={styles.message}>{t('connection.lost')}</span>
      </div>
    </div>
  );
};
