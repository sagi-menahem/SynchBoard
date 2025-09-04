import { TOOLS } from 'features/board/constants/BoardConstants';
import { Circle, Hexagon, Pentagon, Square, Star, Triangle } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Tool } from 'shared/types/CommonTypes';
import { ToolDropdown } from 'shared/ui';

import styles from './CanvasToolSection.module.scss';

/**
 * Props interface for ShapeToolsDropdown component.
 * Defines the current tool state and selection handler for shape tools.
 */
interface ShapeToolsDropdownProps {
  /** Currently selected drawing tool */
  currentTool: Tool;
  /** Handler for tool selection changes */
  onToolSelect: (tool: Tool) => void;
}

/**
 * Configuration array for available shape drawing tools.
 * Each tool includes the tool identifier, icon component, and translation key for various geometric shapes.
 */
const shapeTools = [
  { value: TOOLS.SQUARE, icon: Square, labelKey: 'square' },
  { value: TOOLS.RECTANGLE, icon: Square, labelKey: 'rectangle' },
  { value: TOOLS.CIRCLE, icon: Circle, labelKey: 'circle' },
  { value: TOOLS.TRIANGLE, icon: Triangle, labelKey: 'triangle' },
  { value: TOOLS.STAR, icon: Star, labelKey: 'star' },
  { value: TOOLS.PENTAGON, icon: Pentagon, labelKey: 'pentagon' },
  { value: TOOLS.HEXAGON, icon: Hexagon, labelKey: 'hexagon' },
];

/**
 * Dropdown component for selecting geometric shape drawing tools in the canvas toolbar.
 * This component provides access to various shape tools including squares, rectangles,
 * circles, triangles, stars, and polygons with consistent iconography and labeling.
 * 
 * @param currentTool - Currently selected drawing tool
 * @param onToolSelect - Handler for tool selection changes
 */
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
