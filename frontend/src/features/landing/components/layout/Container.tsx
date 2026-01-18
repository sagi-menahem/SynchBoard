import clsx from 'clsx';
import React from 'react';

import styles from './Container.module.scss';

interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  withBorders?: boolean;
}

/**
 * Container component for consistent max-width and optional border styling.
 * Matches the template's Container component with border-x styling.
 * Corner dots should be added explicitly to specific sections (like HeroImageSection).
 */
const Container: React.FC<ContainerProps> = ({
  children,
  className,
  as: Component = 'div',
  withBorders = false,
  ...rest
}) => {
  return (
    <Component
      className={clsx(styles.container, withBorders && styles.withBorders, className)}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default Container;
