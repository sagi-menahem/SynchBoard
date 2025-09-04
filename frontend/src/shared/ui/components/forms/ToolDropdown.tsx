import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useClickOutside } from 'shared/hooks';
import type { Tool } from 'shared/types/CommonTypes';

import Button from './Button';

/**
 * Represents a single tool item in the dropdown.
 */
interface ToolItem {
  value: Tool; // Tool enum value
  icon: React.ComponentType<{ size?: number }>; // Icon component for this tool
  labelKey: string; // Translation key for the tool label
}

/**
 * Props for the ToolDropdown component.
 */
interface ToolDropdownProps {
  currentTool: Tool; // Currently selected tool
  onToolSelect: (tool: Tool) => void; // Callback when tool is selected
  toolItems: ToolItem[]; // Array of available tools
  buttonTitle: string; // Tooltip for the dropdown button
  className?: string;
  styles: Record<string, string>; // CSS modules styles object
  iconSize?: number; // Size of tool icons
  chevronSize?: number; // Size of dropdown chevron
  showLabels?: boolean; // Whether to show text labels in dropdown
}

/**
 * Dropdown component for selecting tools with intelligent positioning.
 * Shows current tool icon with chevron and displays available options in a positioned dropdown.
 * Automatically adjusts position to prevent viewport overflow and provides keyboard navigation.
 * 
 * @param {Tool} currentTool - Currently selected tool value
 * @param {function} onToolSelect - Callback function called when a tool is selected
 * @param {ToolItem[]} toolItems - Array of available tools with icons and labels
 * @param {string} buttonTitle - Tooltip text for the dropdown trigger button
 * @param {string} className - Optional CSS class to apply to the dropdown container
 * @param {Record<string, string>} styles - CSS modules styles object for styling
 * @param {number} iconSize - Size in pixels for tool icons
 * @param {number} chevronSize - Size in pixels for the dropdown chevron icon
 * @param {boolean} showLabels - Whether to display text labels alongside icons in dropdown
 */
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

  // Calculate dropdown position to avoid viewport overflow
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

  // Find current tool item and determine if any tool in dropdown is active
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
