import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import styles from './Dot.module.scss';

const THROTTLE_MS = 32; // ~30fps for distance calculations

interface DotProps {
  top?: boolean;
  left?: boolean;
  right?: boolean;
  bottom?: boolean;
}

/**
 * Interactive corner dot component that glows and scales when mouse is nearby.
 * Positioned at container corners for grid intersection effect.
 */
const Dot: React.FC<DotProps> = ({ top, left, right, bottom }) => {
  const [isNearMouse, setIsNearMouse] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const lastCallRef = useRef(0);

  const checkDistance = useCallback((clientX: number, clientY: number) => {
    if (!dotRef.current) return;

    const dotRect = dotRef.current.getBoundingClientRect();
    const dotCenterX = dotRect.left + dotRect.width / 2;
    const dotCenterY = dotRect.top + dotRect.height / 2;

    const distance = Math.sqrt(
      Math.pow(clientX - dotCenterX, 2) + Math.pow(clientY - dotCenterY, 2)
    );

    setIsNearMouse(distance <= 100);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Throttle to prevent layout thrashing from getBoundingClientRect
      const now = performance.now();
      if (now - lastCallRef.current < THROTTLE_MS) return;
      lastCallRef.current = now;

      checkDistance(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [checkDistance]);

  const positionClasses = [
    styles.dot,
    top && styles.top,
    bottom && styles.bottom,
    left && styles.left,
    right && styles.right,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.div
      ref={dotRef}
      className={positionClasses}
      animate={{
        backgroundColor: isNearMouse ? 'var(--color-primary)' : 'var(--color-border)',
        boxShadow: isNearMouse
          ? '0 0 20px var(--color-primary), 0 0 40px var(--color-primary)'
          : 'none',
        scale: isNearMouse ? 1.5 : 1,
        borderRadius: isNearMouse ? '50%' : '0%',
      }}
      transition={{
        duration: 0.3,
        ease: 'easeOut',
      }}
    />
  );
};

export default Dot;
