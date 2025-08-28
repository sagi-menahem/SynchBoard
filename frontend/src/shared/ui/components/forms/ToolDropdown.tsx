import React, { useRef, useState } from 'react';

import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useClickOutside } from 'shared/hooks';
import type { Tool } from 'shared/types/CommonTypes';

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const handleToolClick = (tool: Tool) => {
    onToolSelect(tool);
    setIsOpen(false);
  };

  const currentToolItem = toolItems.find((item) => item.value === currentTool) || toolItems[0];
  const isToolActive = toolItems.some((item) => item.value === currentTool);

  return (
    <div className={`${styles.shapeDropdown || styles.dropdown} ${className}`} ref={dropdownRef}>
      <button
        className={`${styles.dropdownButton} ${isToolActive ? styles.active : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={buttonTitle}
      >
        <currentToolItem.icon size={iconSize} />
        <ChevronDown size={chevronSize} />
      </button>
      
      <div className={`${styles.dropdownContent} ${!isOpen && styles.hidden ? styles.hidden : isOpen ? '' : styles.hidden || 'hidden'}`}>
        {toolItems.map(({ value, icon: Icon, labelKey }) => (
          <button
            key={value}
            className={`${styles.dropdownItem} ${value === currentTool ? styles.active : ''}`}
            onClick={() => handleToolClick(value)}
            title={t(`board:toolbar.tool.${labelKey}`)}
          >
            <Icon size={iconSize} />
            {showLabels && <span>{t(`board:toolbar.tool.${labelKey}`)}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};