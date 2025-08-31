import React from 'react';

import styles from './ToolGroup.module.scss';

interface ToolGroupProps {
  label: string;
  children: React.ReactNode;
}

export const ToolGroup: React.FC<ToolGroupProps> = ({ label, children }) => {
  return (
    <div className={styles.toolGroup}>
      <div className={styles.toolControls}>
        {children}
      </div>
      <span className={styles.toolLabel}>{label}</span>
    </div>
  );
};

export default ToolGroup;