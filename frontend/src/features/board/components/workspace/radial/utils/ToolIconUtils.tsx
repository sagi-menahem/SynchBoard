import { TOOLS } from 'features/board/constants/BoardConstants';
import {
  ArrowRight,
  Brush,
  Circle,
  Hexagon,
  Minus,
  MoreHorizontal,
  Palette,
  Pentagon,
  Square,
  Star,
  Triangle,
} from 'lucide-react';
import React from 'react';

import type { Tool } from 'shared/types/CommonTypes';

import { LINE_TOOLS, SHAPE_TOOLS } from '../constants/RadialDockConstants';
import styles from '../RadialDock.module.scss';
import type { ToolItem } from '../types/RadialDockTypes';

/**
 * Gets the icon for shape tools based on current selection.
 */
export const getShapeIcon = (currentTool: Tool, size = 20): React.ReactNode => {
  switch (currentTool) {
    case TOOLS.SQUARE:
      return <Square size={size} />;
    case TOOLS.CIRCLE:
      return <Circle size={size} />;
    case TOOLS.TRIANGLE:
      return <Triangle size={size} />;
    case TOOLS.PENTAGON:
      return <Pentagon size={size} />;
    case TOOLS.HEXAGON:
      return <Hexagon size={size} />;
    case TOOLS.STAR:
      return <Star size={size} />;
    default:
      return <Square size={size} />;
  }
};

/**
 * Gets the icon for line tools based on current selection.
 */
export const getLineIcon = (currentTool: Tool, size = 20): React.ReactNode => {
  switch (currentTool) {
    case TOOLS.LINE:
      return <Minus size={size} />;
    case TOOLS.ARROW:
      return <ArrowRight size={size} />;
    case TOOLS.DOTTED_LINE:
      return <MoreHorizontal size={size} />;
    default:
      return <Minus size={size} />;
  }
};

/**
 * Checks if a satellite button should show active state.
 */
export const isSatelliteActive = (satelliteType: string, currentTool: Tool): boolean => {
  if (satelliteType === 'shapes') {
    return SHAPE_TOOLS.includes(currentTool as (typeof SHAPE_TOOLS)[number]);
  }
  if (satelliteType === 'lines') {
    return LINE_TOOLS.includes(currentTool as (typeof LINE_TOOLS)[number]);
  }
  return false;
};

/**
 * Creates the icon element for a tool item.
 * Handles static icons, dynamic shape/line icons, and color palette indicator.
 */
export const createToolIcon = (
  item: ToolItem,
  defaultTool: Tool,
  defaultStrokeColor: string,
  size = 20,
): React.ReactNode => {
  if (!item.isDynamic) {
    return item.icon;
  }

  // Dynamic icons based on current tool
  if (item.tool === 'shapes') {
    return getShapeIcon(defaultTool, size);
  }
  if (item.tool === 'lines') {
    return getLineIcon(defaultTool, size);
  }
  if (item.tool === 'colorPalette') {
    return (
      <div className={styles.colorPaletteIcon}>
        <Palette size={size} />
        <div className={styles.colorIndicator} style={{ backgroundColor: defaultStrokeColor }} />
      </div>
    );
  }

  return item.icon;
};

/**
 * Gets the currently active tool icon for display in collapsed state.
 */
export const getActiveToolIcon = (
  dockTools: ToolItem[],
  defaultTool: Tool,
  _defaultStrokeColor: string,
  getToolIcon: (item: ToolItem, size?: number) => React.ReactNode,
): React.ReactNode => {
  // Find the active tool in DOCK_TOOLS
  const directTool = dockTools.find((t) => t.type === 'direct' && t.tool === defaultTool);
  if (directTool) {
    return getToolIcon(directTool, 20);
  }

  // Check if it's a shape tool
  if (SHAPE_TOOLS.includes(defaultTool as (typeof SHAPE_TOOLS)[number])) {
    return getShapeIcon(defaultTool, 20);
  }

  // Check if it's a line tool
  if (LINE_TOOLS.includes(defaultTool as (typeof LINE_TOOLS)[number])) {
    return getLineIcon(defaultTool, 20);
  }

  // Default fallback
  return <Brush size={20} />;
};

/**
 * Checks if a tool item is currently active.
 */
export const checkIsToolActive = (item: ToolItem, defaultTool: Tool): boolean => {
  if (item.type === 'direct') {
    return defaultTool === item.tool;
  }
  // For satellite buttons, check if current tool belongs to that category
  return isSatelliteActive(item.tool as string, defaultTool);
};
