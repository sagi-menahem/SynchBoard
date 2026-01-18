import { useTheme } from 'features/settings/ThemeProvider';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Dot } from '../../common';
import { Container } from '../../layout';

import styles from './HeroImageSection.module.scss';

const THROTTLE_MS = 16; // ~60fps

/**
 * Hero image section with parallax mouse-tracking effect.
 * Displays the main workspace screenshot with smooth movement.
 * Uses theme-aware images (light/dark variants).
 */
const HeroImageSection: React.FC = () => {
  const { theme } = useTheme();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const lastCallRef = useRef(0);

  // Motion values for mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring configuration for smooth movement
  const springConfig = { stiffness: 300, damping: 30 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // Transform mouse position to image movement (inverted for parallax effect)
  const imageX = useTransform(x, [-1, 1], [40, -40]);
  const imageY = useTransform(y, [-1, 1], [40, -40]);

  // Select image based on current theme
  const screenshotSrc = useMemo(() => {
    return theme === 'dark'
      ? '/screenshots/workspace-en-dark.jpg'
      : '/screenshots/workspace-en-light.jpg';
  }, [theme]);

  // Detect touch device on mount
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia('(pointer: coarse)').matches
      );
    };
    checkTouchDevice();
  }, []);

  // Handle mouse move over the section
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isTouchDevice) return;

      // Throttle to prevent layout thrashing from getBoundingClientRect
      const now = performance.now();
      if (now - lastCallRef.current < THROTTLE_MS) return;
      lastCallRef.current = now;

      const rect = event.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalize to -1 to 1 range
      const normalizedX = (event.clientX - centerX) / (rect.width / 2);
      const normalizedY = (event.clientY - centerY) / (rect.height / 2);

      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
    },
    [isTouchDevice, mouseX, mouseY]
  );

  // Reset position when mouse leaves
  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <Container withBorders className={styles.heroImage}>
      <Dot top left />
      <Dot top right />
      <Dot bottom left />
      <Dot bottom right />
      <div className={styles.gridBackground} />
      <motion.div
        className={styles.imageWrapper}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.img
          src={screenshotSrc}
          alt="SynchBoard workspace preview"
          className={styles.screenshot}
          style={isTouchDevice ? {} : { x: imageX, y: imageY }}
          draggable={false}
          loading="lazy"
          decoding="async"
          width={1920}
          height={1080}
        />
      </motion.div>
    </Container>
  );
};

export default HeroImageSection;
