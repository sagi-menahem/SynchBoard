import clsx from 'clsx';
import { TOOLS } from 'features/board/constants/BoardConstants';
import { ArrowRight, Minus } from 'lucide-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { Tool } from 'shared/types/CommonTypes';
import Button from 'shared/ui/components/forms/Button';

import styles from './CanvasToolSection.module.scss';

/**
 * Props interface for LineToolsGroup component.
 * Defines the current tool state and selection handler for line tool buttons.
 */
interface LineToolsGroupProps {
  /** Currently selected drawing tool */
  currentTool: Tool;
  /** Handler for tool selection changes */
  onToolSelect: (tool: Tool) => void;
}

/**
 * Group of individual line tool buttons displayed as a horizontal toolbar section.
 * This component renders separate buttons for line tools including straight line,
 * dotted line (with custom SVG icon), and arrow tools with active state indication.
 * 
 * @param currentTool - Currently selected drawing tool
 * @param onToolSelect - Handler for tool selection changes
 */
export const LineToolsGroup: React.FC<LineToolsGroupProps> = ({ currentTool, onToolSelect }) => {
  const { t } = useTranslation(['board', 'common']);

  const handleToolClick = useCallback(
    (tool: Tool) => {
      onToolSelect(tool);
    },
    [onToolSelect],
  );

  return (
    <>
      <Button
        variant="icon"
        className={clsx(styles.iconButton, currentTool === TOOLS.LINE && styles.active)}
        onClick={() => handleToolClick(TOOLS.LINE)}
        title={t('board:toolbar.tool.line')}
      >
        <Minus size={20} />
      </Button>
      <Button
        variant="icon"
        className={clsx(styles.iconButton, currentTool === TOOLS.DOTTED_LINE && styles.active)}
        onClick={() => handleToolClick(TOOLS.DOTTED_LINE)}
        title={t('board:toolbar.tool.dottedLine')}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="2"
            y1="10"
            x2="5"
            y2="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="8"
            y1="10"
            x2="11"
            y2="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="14"
            y1="10"
            x2="17"
            y2="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </Button>
      <Button
        variant="icon"
        className={clsx(styles.iconButton, currentTool === TOOLS.ARROW && styles.active)}
        onClick={() => handleToolClick(TOOLS.ARROW)}
        title={t('board:toolbar.tool.arrow')}
      >
        <ArrowRight size={20} />
      </Button>
    </>
  );
};
