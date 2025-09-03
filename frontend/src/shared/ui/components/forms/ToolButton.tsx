import React from 'react';

import type { Tool } from 'shared/types/CommonTypes';
import Button from 'shared/ui/components/forms/Button';

import styles from './Button.module.scss';

interface ToolButtonProps {
  tool: Tool;
  currentTool: Tool;
  onClick: (tool: Tool) => void;
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
}

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