import clsx from 'clsx';
import React from 'react';

import styles from './DivideX.module.scss';

interface DivideXProps {
  className?: string;
}

/**
 * Horizontal divider line between sections.
 * Matches the template's DivideX component.
 */
const DivideX: React.FC<DivideXProps> = ({ className }) => {
  return <div className={clsx(styles.divide, className)} />;
};

export default DivideX;
