
import { TOOLS } from 'features/board/constants/BoardConstants';
import { ArrowRight, Minus, MoreHorizontal } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Tool } from 'shared/types/CommonTypes';
import { ToolDropdown } from 'shared/ui';

import styles from './CanvasToolSection.module.scss';

interface LineToolsDropdownProps {
  currentTool: Tool;
  onToolSelect: (tool: Tool) => void;
}

const LINE_TOOLS = [
  { value: TOOLS.LINE, icon: Minus, labelKey: 'line' },
  { value: TOOLS.DOTTED_LINE, icon: MoreHorizontal, labelKey: 'dottedLine' },
  { value: TOOLS.ARROW, icon: ArrowRight, labelKey: 'arrow' },
];

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
