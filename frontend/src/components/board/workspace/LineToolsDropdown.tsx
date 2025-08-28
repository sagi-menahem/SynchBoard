import React, { useEffect, useRef, useState } from 'react';

import { ArrowRight, ChevronDown, Minus, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { TOOLS } from 'constants/BoardConstants';
import type { Tool } from 'types/CommonTypes';

import styles from './CanvasToolSection.module.css';

interface LineToolsDropdownProps {
  currentTool: Tool;
  onToolSelect: (tool: Tool) => void;
}

const LINE_TOOLS = [
  { value: TOOLS.LINE, icon: Minus, labelKey: 'line' },
  { value: TOOLS.DOTTED_LINE, icon: MoreHorizontal, labelKey: 'dottedLine' },
  { value: TOOLS.ARROW, icon: ArrowRight, labelKey: 'arrow' },
] as const;

export const LineToolsDropdown: React.FC<LineToolsDropdownProps> = ({
  currentTool,
  onToolSelect,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleToolClick = (tool: Tool) => {
    onToolSelect(tool);
    setIsOpen(false);
  };

  const currentLineTool = LINE_TOOLS.find((tool) => tool.value === currentTool) || LINE_TOOLS[0];
  const isLineToolActive = LINE_TOOLS.some((tool) => tool.value === currentTool);

  return (
    <div className={styles.shapeDropdown} ref={dropdownRef}>
      <button
        className={`${styles.dropdownButton} ${isLineToolActive ? styles.active : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={t('toolbar.tool.lines')}
      >
        <currentLineTool.icon size={20} />
        <ChevronDown size={14} />
      </button>
      
      {isOpen && (
        <div className={styles.dropdownContent}>
          {LINE_TOOLS.map(({ value, icon: Icon, labelKey }) => (
            <button
              key={value}
              className={`${styles.dropdownItem} ${value === currentTool ? styles.active : ''}`}
              onClick={() => handleToolClick(value)}
              title={t(`toolbar.tool.${value}`)}
            >
              <Icon size={20} />
              <span>{t(`toolbar.tool.${labelKey}`)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};