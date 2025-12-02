import React from 'react';

import type { Tool } from 'shared/types/CommonTypes';
import Button from 'shared/ui/components/forms/Button';

import styles from './Button.module.scss';

/**
 * Props for the ToolButton component.
 */
interface ToolButtonProps {
  tool: Tool; // Tool type this button represents
  currentTool: Tool; // Currently active tool for comparison
  onClick: (tool: Tool) => void; // Callback when button is clicked
  children: React.ReactNode; // Button content (typically an icon)
  title: string; // Tooltip text for the button
  disabled?: boolean; // Whether the button is disabled
}

/**
 * Specialized button component for toolbar tools with active state management.
 * Automatically applies active styling when the tool matches the current tool.
 * Provides consistent interaction patterns for tool selection interfaces.
 *
 * @param {Tool} tool - Tool type that this button represents
 * @param {Tool} currentTool - Currently active tool for visual comparison
 * @param {function} onClick - Callback function called when button is clicked
 * @param {React.ReactNode} children - Button content, typically an icon representing the tool
 * @param {string} title - Tooltip text displayed on hover
 * @param {boolean} disabled - Whether the button is disabled and non-interactive
 */
export const ToolButton: React.FC<ToolButtonProps> = ({
  tool,
  currentTool,
  onClick,
  children,
  title,
  disabled = false,
}) => {
  return (
    <Button
      variant="icon"
      className={currentTool === tool ? styles.active : ''}
      onClick={() => onClick(tool)}
      title={title}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

export default ToolButton;
