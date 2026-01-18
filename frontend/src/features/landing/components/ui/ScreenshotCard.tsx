import React, { useMemo, useState } from 'react';

import styles from './ScreenshotCard.module.scss';

interface ScreenshotCardProps {
  src: string;
  alt: string;
  caption: string;
}

/**
 * Individual screenshot card with image and caption.
 * Includes loading state and hover effects.
 * Uses WebP format with responsive srcSet for better performance.
 */
const ScreenshotCard: React.FC<ScreenshotCardProps> = ({ src, alt, caption }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Generate WebP sources from the original JPG path
  const imageSources = useMemo(() => {
    const basePath = src.replace(/\.jpg$/, '');
    const isMobile = src.includes('mobile-');

    return {
      webp: {
        // Mobile images don't have responsive sizes
        srcSet: isMobile
          ? `${basePath}.webp`
          : `${basePath}-640w.webp 640w, ${basePath}-1024w.webp 1024w, ${basePath}.webp 1920w`,
        // Optimized for performance: declare smaller size to force 640w selection
        // This slightly reduces sharpness on 2x DPR but significantly improves load time
        // These are lazy-loaded below-the-fold images so the tradeoff is worthwhile
        sizes: isMobile ? undefined : '(max-width: 640px) 100vw, 300px',
      },
      fallback: src,
    };
  }, [src]);

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {!isLoaded && !hasError && <div className={styles.skeleton} />}
        {hasError ? (
          <div className={styles.errorPlaceholder}>
            <span>Image unavailable</span>
          </div>
        ) : (
          <picture>
            <source
              srcSet={imageSources.webp.srcSet}
              sizes={imageSources.webp.sizes}
              type="image/webp"
            />
            <img
              src={imageSources.fallback}
              alt={alt}
              className={`${styles.image} ${isLoaded ? styles.loaded : ''}`}
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
              loading="lazy"
              decoding="async"
              width={1920}
              height={1080}
            />
          </picture>
        )}
      </div>
      <p className={styles.caption}>{caption}</p>
    </div>
  );
};

export default ScreenshotCard;
