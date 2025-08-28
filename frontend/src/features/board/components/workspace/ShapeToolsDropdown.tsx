
import React from 'react';

import { TOOLS } from 'features/board/constants/BoardConstants';
import {
  Circle,
  Hexagon,
  Pentagon,
  Square,
  Star,
  Triangle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Tool } from 'shared/types/CommonTypes';
import { ToolDropdown } from 'shared/ui';

import styles from './CanvasToolSection.module.css';

interface ShapeToolsDropdownProps {
  currentTool: Tool;
  onToolSelect: (tool: Tool) => void;
}

const shapeTools = [
  { value: TOOLS.SQUARE, icon: Square, labelKey: 'square' },
  { value: TOOLS.RECTANGLE, icon: Square, labelKey: 'rectangle' },
  { value: TOOLS.CIRCLE, icon: Circle, labelKey: 'circle' },
  { value: TOOLS.TRIANGLE, icon: Triangle, labelKey: 'triangle' },
  { value: TOOLS.STAR, icon: Star, labelKey: 'star' },
  { value: TOOLS.PENTAGON, icon: Pentagon, labelKey: 'pentagon' },
  { value: TOOLS.HEXAGON, icon: Hexagon, labelKey: 'hexagon' },
];

export const ShapeToolsDropdown: React.FC<ShapeToolsDropdownProps> = ({
  currentTool,
  onToolSelect,
}) => {
  const { t } = useTranslation(['board', 'common']);

  return (
    <ToolDropdown
      currentTool={currentTool}
      onToolSelect={onToolSelect}
      toolItems={shapeTools}
      buttonTitle={t('board:toolbar.shapeTools')}
      styles={styles}
      iconSize={16}
      chevronSize={12}
    />
  );
};