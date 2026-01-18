import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

import styles from './Dot.module.scss';

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isNearMouse, setIsNearMouse] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (dotRef.current) {
      const dotRect = dotRef.current.getBoundingClientRect();
      const dotCenterX = dotRect.left + dotRect.width / 2;
      const dotCenterY = dotRect.top + dotRect.height / 2;

      const distance = Math.sqrt(
        Math.pow(mousePosition.x - dotCenterX, 2) + Math.pow(mousePosition.y - dotCenterY, 2)
      );

      setIsNearMouse(distance <= 100);
    }
  }, [mousePosition]);

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
