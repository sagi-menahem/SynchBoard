import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: -9999, left: -9999 });
  const [isPositioned, setIsPositioned] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 160;
      const dropdownHeight = toolItems.length * 40;
      const margin = 8;

      let left = buttonRect.left;
      let top = buttonRect.bottom + margin;

      if (left + dropdownWidth > window.innerWidth) {
        left = buttonRect.right - dropdownWidth;
      }

      if (left < margin) {
        left = margin;
      }

      if (top + dropdownHeight > window.innerHeight) {
        top = buttonRect.top - dropdownHeight - margin;
      }

      if (top < margin) {
        top = margin;
      }

      setDropdownPosition({ top, left });
      setIsPositioned(true);
    } else if (!isOpen) {
      setIsPositioned(false);
    }
  }, [isOpen, toolItems.length]);

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
        className={clsx(
          styles.dropdownContent,
          (!isOpen || !isPositioned) && (styles.hidden ?? 'hidden'),
        )}
        style={
          isOpen && isPositioned
            ? {
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
              }
            : undefined
        }
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
