import { useTheme } from 'features/settings/ThemeProvider';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Dot } from '../../common';
import { Container } from '../../layout';

import styles from './HeroImageSection.module.scss';

const THROTTLE_MS = 16; // ~60fps

/**
 * Hero image section with parallax mouse-tracking effect.
 * Displays the main workspace screenshot with smooth movement.
 * Uses CSS transforms for GPU-accelerated animations (no Framer Motion for better LCP).
 * Serves optimized WebP images with responsive srcSet for better performance.
 */
const HeroImageSection: React.FC = () => {
  const { theme } = useTheme();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const lastCallRef = useRef(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Select image based on current theme
  const themeVariant = theme === 'dark' ? 'dark' : 'light';

  // Image sources for responsive loading
  // Hero image is in a padded container, actual display width is ~600px on desktop
  // - Mobile (<640px): 100% of viewport
  // - Desktop: ~600px actual display width (rounded to 640px for proper srcSet selection)
  const imageSources = useMemo(() => ({
    webp: {
      srcSet: `/screenshots/workspace-en-${themeVariant}-640w.webp 640w, /screenshots/workspace-en-${themeVariant}-1024w.webp 1024w, /screenshots/workspace-en-${themeVariant}.webp 1920w`,
      sizes: '(max-width: 640px) 100vw, 640px',
    },
    fallback: `/screenshots/workspace-en-${themeVariant}.jpg`,
  }), [themeVariant]);

  // Detect touch device and trigger entrance animation on mount
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia('(pointer: coarse)').matches
      );
    };
    checkTouchDevice();

    // Trigger entrance animation after a brief delay
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  // Handle mouse move over the section - update CSS custom properties
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isTouchDevice || !imageRef.current) return;

      // Throttle to prevent layout thrashing from getBoundingClientRect
      const now = performance.now();
      if (now - lastCallRef.current < THROTTLE_MS) return;
      lastCallRef.current = now;

      const rect = event.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalize to -1 to 1 range, then multiply by movement amount
      const normalizedX = (event.clientX - centerX) / (rect.width / 2);
      const normalizedY = (event.clientY - centerY) / (rect.height / 2);

      // Apply parallax movement (inverted for parallax effect)
      const moveX = -normalizedX * 40;
      const moveY = -normalizedY * 40;

      imageRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
    },
    [isTouchDevice]
  );

  // Reset position when mouse leaves
  const handleMouseLeave = useCallback(() => {
    if (imageRef.current) {
      imageRef.current.style.transform = 'translate(0px, 0px)';
    }
  }, []);

  return (
    <Container withBorders className={styles.heroImage}>
      <Dot top left />
      <Dot top right />
      <Dot bottom left />
      <Dot bottom right />
      <div className={styles.gridBackground} />
      <div
        ref={wrapperRef}
        className={`${styles.imageWrapper} ${isVisible ? styles.visible : ''}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        role="img"
        aria-label="SynchBoard workspace preview"
      >
        <picture>
          <source
            srcSet={imageSources.webp.srcSet}
            sizes={imageSources.webp.sizes}
            type="image/webp"
          />
          <img
            ref={imageRef}
            src={imageSources.fallback}
            alt="SynchBoard workspace preview"
            className={styles.screenshot}
            draggable={false}
            // LCP image - NO lazy loading, high priority
            fetchPriority="high"
            decoding="async"
            width={1920}
            height={1080}
          />
        </picture>
      </div>
    </Container>
  );
};

export default HeroImageSection;
