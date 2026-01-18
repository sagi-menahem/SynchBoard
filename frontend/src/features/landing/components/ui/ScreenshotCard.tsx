import React, { useState } from 'react';

import styles from './ScreenshotCard.module.scss';

interface ScreenshotCardProps {
  src: string;
  alt: string;
  caption: string;
}

/**
 * Individual screenshot card with image and caption.
 * Includes loading state and hover effects.
 */
const ScreenshotCard: React.FC<ScreenshotCardProps> = ({ src, alt, caption }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {!isLoaded && !hasError && <div className={styles.skeleton} />}
        {hasError ? (
          <div className={styles.errorPlaceholder}>
            <span>Image unavailable</span>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            className={`${styles.image} ${isLoaded ? styles.loaded : ''}`}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            loading="lazy"
          />
        )}
      </div>
      <p className={styles.caption}>{caption}</p>
    </div>
  );
};

export default ScreenshotCard;
