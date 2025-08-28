
import React, { useCallback } from 'react';

import { TOOLS } from 'features/board/constants/BoardConstants';
import {
  ArrowRight,
  Minus,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Tool } from 'shared/types/CommonTypes';

import styles from './CanvasToolSection.module.css';

interface LineToolsGroupProps {
  currentTool: Tool;
  onToolSelect: (tool: Tool) => void;
}

export const LineToolsGroup: React.FC<LineToolsGroupProps> = ({
  currentTool,
  onToolSelect,
}) => {
  const { t } = useTranslation(['board', 'common']);

  const handleToolClick = useCallback((tool: Tool) => {
    onToolSelect(tool);
  }, [onToolSelect]);

  return (
    <>
      <button
        className={`${styles.iconButton} ${currentTool === TOOLS.LINE ? styles.active : ''}`}
        onClick={() => handleToolClick(TOOLS.LINE)}
        title={t('board:toolbar.tool.line')}
      >
        <Minus size={20} />
      </button>
      <button
        className={`${styles.iconButton} ${currentTool === TOOLS.DOTTED_LINE ? styles.active : ''}`}
        onClick={() => handleToolClick(TOOLS.DOTTED_LINE)}
        title={t('board:toolbar.tool.dottedLine')}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="2" y1="10" x2="5" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="8" y1="10" x2="11" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="14" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
      <button
        className={`${styles.iconButton} ${currentTool === TOOLS.ARROW ? styles.active : ''}`}
        onClick={() => handleToolClick(TOOLS.ARROW)}
        title={t('board:toolbar.tool.arrow')}
      >
        <ArrowRight size={20} />
      </button>
    </>
  );
};