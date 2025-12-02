import clsx from 'clsx';
import React from 'react';

import styles from './Skeleton.module.scss';

/**
 * Props for the Skeleton component.
 */
interface SkeletonProps {
  /** Shape variant of the skeleton */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** Width of the skeleton (CSS value) */
  width?: string | number;
  /** Height of the skeleton (CSS value) */
  height?: string | number;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Base skeleton component with shimmer animation for loading states.
 * Provides a visual placeholder that indicates content is loading.
 *
 * @param variant - Shape of the skeleton: 'text' (default), 'circular', 'rectangular', 'rounded'
 * @param width - Width as CSS value (e.g., '100%', 200, '10rem')
 * @param height - Height as CSS value (e.g., '1em', 40, '2rem')
 * @param className - Additional CSS classes
 * @param style - Additional inline styles
 */
const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className,
  style,
}) => {
  const skeletonStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style,
  };

  return (
    <div
      className={clsx(styles.skeleton, styles[variant], className)}
      style={skeletonStyle}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
