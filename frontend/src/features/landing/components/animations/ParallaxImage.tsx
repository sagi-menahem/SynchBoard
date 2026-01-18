import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';

import styles from './ParallaxImage.module.scss';

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
}

/**
 * Mouse-tracking parallax effect for images.
 * Creates a subtle 3D effect based on mouse position.
 * Disabled on touch devices for better mobile experience.
 */
const ParallaxImage: React.FC<ParallaxImageProps> = ({ src, alt, className }) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 30 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(springY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);
  const translateX = useTransform(springX, [-0.5, 0.5], [-10, 10]);
  const translateY = useTransform(springY, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isTouchDevice) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const x = (event.clientX - centerX) / rect.width;
      const y = (event.clientY - centerY) / rect.height;

      mouseX.set(x);
      mouseY.set(y);
    },
    [isTouchDevice, mouseX, mouseY],
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  if (isTouchDevice) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <img src={src} alt={alt} className={styles.image} />
      </div>
    );
  }

  return (
    <motion.div
      className={`${styles.container} ${className || ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
      }}
    >
      <motion.img
        src={src}
        alt={alt}
        className={styles.image}
        style={{
          rotateX,
          rotateY,
          x: translateX,
          y: translateY,
        }}
      />
    </motion.div>
  );
};

export default ParallaxImage;
