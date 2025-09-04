import React from 'react';

import styles from './ToolGroup.module.scss';

/**
 * Props for the ToolGroup component.
 */
interface ToolGroupProps {
  label: string; // Label text displayed below the tools
  children: React.ReactNode; // Tool buttons or controls to group together
}

/**
 * Container component for grouping related toolbar tools with a descriptive label.
 * Provides consistent spacing and layout for tool button collections.
 * Used to organize tools into logical categories within toolbars.
 * 
 * @param {string} label - Descriptive text displayed below the grouped tools
 * @param {React.ReactNode} children - Tool buttons or other controls to group together
 */
export const ToolGroup: React.FC<ToolGroupProps> = ({ label, children }) => {
  return (
    <div className={styles.toolGroup}>
      <div className={styles.toolControls}>{children}</div>
      <span className={styles.toolLabel}>{label}</span>
    </div>
  );
};

export default ToolGroup;
