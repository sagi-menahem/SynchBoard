import { TOOLS } from 'constants';

import React, { useCallback, useRef, useState } from 'react';

import {
  ChevronDown,
  Circle,
  Hexagon,
  Pentagon,
  Square,
  Triangle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';


import { useClickOutside } from 'hooks/common';
import type { Tool } from 'types/CommonTypes';

import styles from './HeaderToolbar.module.css';

interface ShapeToolsDropdownProps {
  currentTool: Tool;
  onToolSelect: (tool: Tool) => void;
}

const shapeTools = [
  { tool: TOOLS.RECTANGLE, icon: Square, labelKey: 'rectangle' },
  { tool: TOOLS.CIRCLE, icon: Circle, labelKey: 'circle' },
  { tool: TOOLS.TRIANGLE, icon: Triangle, labelKey: 'triangle' },
  { tool: TOOLS.PENTAGON, icon: Pentagon, labelKey: 'pentagon' },
  { tool: TOOLS.HEXAGON, icon: Hexagon, labelKey: 'hexagon' },
];

export const ShapeToolsDropdown: React.FC<ShapeToolsDropdownProps> = ({
  currentTool,
  onToolSelect,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleToolSelect = useCallback((tool: Tool) => {
    onToolSelect(tool);
    setIsOpen(false);
  }, [onToolSelect]);

  // Find the current shape tool or default to rectangle
  const currentShapeTool = shapeTools.find((shape) => shape.tool === currentTool) || shapeTools[0];
  const isShapeToolActive = shapeTools.some((shape) => shape.tool === currentTool);

  return (
    <div className={styles.shapeDropdown} ref={dropdownRef}>
      <button
        className={`${styles.dropdownButton} ${isShapeToolActive ? styles.active : ''}`}
        onClick={handleToggle}
        title="Shape Tools"
      >
        <currentShapeTool.icon size={16} />
        <ChevronDown size={12} />
      </button>
      
      <div className={`${styles.dropdownContent} ${isOpen ? '' : styles.hidden}`}>
        {shapeTools.map(({ tool, icon: Icon, labelKey }) => (
          <button
            key={tool}
            className={`${styles.dropdownItem} ${currentTool === tool ? styles.active : ''}`}
            onClick={() => handleToolSelect(tool as Tool)}
            title={t(`toolbar.tool.${labelKey}`)}
          >
            <Icon size={16} />
            <span>{t(`toolbar.tool.${labelKey}`)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};