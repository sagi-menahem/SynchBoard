import React, { useEffect, useRef, useState } from 'react';

import styles from './FadeInView.module.scss';

interface FadeInViewProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}

/**
 * Scroll-triggered fade-in animation wrapper using CSS animations + IntersectionObserver.
 * Uses GPU-accelerated CSS transforms for better performance than Framer Motion.
 * Wraps content and animates it into view when scrolled into the viewport.
 */
const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  className,
  once = true,
  amount = 0.3,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: amount },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [once, amount]);

  const directionClass = styles[direction] || styles.up;

  return (
    <div
      ref={ref}
      className={`${styles.fadeInView} ${directionClass} ${isVisible ? styles.visible : ''} ${className || ''}`}
      style={
        {
          '--fade-delay': `${delay}s`,
          '--fade-duration': `${duration}s`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
};

export default FadeInView;
