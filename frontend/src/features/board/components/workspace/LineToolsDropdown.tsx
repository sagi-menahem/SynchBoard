import { TOOLS } from 'features/board/constants/BoardConstants';
import { ArrowRight, Minus, MoreHorizontal } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Tool } from 'shared/types/CommonTypes';
import { ToolDropdown } from 'shared/ui';

import styles from './CanvasToolSection.module.scss';

/**
 * Props interface for LineToolsDropdown component.
 * Defines the current tool state and selection handler for line tools.
 */
interface LineToolsDropdownProps {
  /** Currently selected drawing tool */
  currentTool: Tool;
  /** Handler for tool selection changes */
  onToolSelect: (tool: Tool) => void;
}

/**
 * Configuration array for available line drawing tools.
 * Each tool includes the tool identifier, icon component, and translation key.
 */
const LINE_TOOLS = [
  { value: TOOLS.LINE, icon: Minus, labelKey: 'line' },
  { value: TOOLS.DOTTED_LINE, icon: MoreHorizontal, labelKey: 'dottedLine' },
  { value: TOOLS.ARROW, icon: ArrowRight, labelKey: 'arrow' },
];

/**
 * Dropdown component for selecting line drawing tools in the canvas toolbar.
 * This component provides a compact interface for accessing various line tools including
 * straight lines, dotted lines, and arrows with consistent iconography and labeling.
 * 
 * @param currentTool - Currently selected drawing tool
 * @param onToolSelect - Handler for tool selection changes
 */
export const LineToolsDropdown: React.FC<LineToolsDropdownProps> = ({
  currentTool,
  onToolSelect,
}) => {
  const { t } = useTranslation(['board', 'common']);

  return (
    <ToolDropdown
      currentTool={currentTool}
      onToolSelect={onToolSelect}
      toolItems={LINE_TOOLS}
      buttonTitle={t('board:toolbar.tool.lines')}
      styles={styles}
      iconSize={20}
      chevronSize={14}
    />
  );
};
