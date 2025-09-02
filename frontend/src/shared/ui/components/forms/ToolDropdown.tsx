import React, { useRef, useState, useEffect } from 'react';

import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useClickOutside } from 'shared/hooks';
import type { Tool } from 'shared/types/CommonTypes';

import Button from './Button';

interface ToolItem {
  value: Tool;
  icon: React.ComponentType<{ size?: number }>;
  labelKey: string;
}

interface ToolDropdownProps {
  currentTool: Tool;
  onToolSelect: (tool: Tool) => void;
  toolItems: ToolItem[];
  buttonTitle: string;
  className?: string;
  styles: Record<string, string>;
  iconSize?: number;
  chevronSize?: number;
  showLabels?: boolean;
}

export const ToolDropdown: React.FC<ToolDropdownProps> = ({
  currentTool,
  onToolSelect,
  toolItems,
  buttonTitle,
  className = '',
  styles,
  iconSize = 20,
  chevronSize = 14,
  showLabels = true,
}) => {
  const { t } = useTranslation(['board', 'common']);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: buttonRect.bottom + 8, // 8px margin below button
        left: buttonRect.left,
      });
    }
  }, [isOpen]);

  const handleToolClick = (tool: Tool) => {
    onToolSelect(tool);
    setIsOpen(false);
  };

  const currentToolItem = toolItems.find((item) => item.value === currentTool) ?? toolItems[0];
  const isToolActive = toolItems.some((item) => item.value === currentTool);

  return (
    <div className={clsx(styles.shapeDropdown ?? styles.dropdown, className)} ref={dropdownRef}>
      <Button
        ref={buttonRef}
        variant="icon"
        className={clsx(styles.dropdownButton, isToolActive && styles.active)}
        onClick={() => setIsOpen(!isOpen)}
        title={buttonTitle}
      >
        <currentToolItem.icon size={iconSize} />
        <ChevronDown size={chevronSize} />
      </Button>
      
      <div 
        className={clsx(styles.dropdownContent, !isOpen && (styles.hidden ?? 'hidden'))}
        style={isOpen ? { 
          top: `${dropdownPosition.top}px`, 
          left: `${dropdownPosition.left}px` 
        } : undefined}
      >
        {toolItems.map(({ value, icon: Icon, labelKey }) => (
          <Button
            key={value}
            variant="icon"
            className={clsx(styles.dropdownItem, value === currentTool && styles.active)}
            onClick={() => handleToolClick(value)}
            title={t(`board:toolbar.tool.${labelKey}`)}
          >
            <Icon size={iconSize} />
            {showLabels && <span>{t(`board:toolbar.tool.${labelKey}`)}</span>}
          </Button>
        ))}
      </div>
    </div>
  );
};