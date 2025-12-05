import { TOOLS } from 'features/board/constants/BoardConstants';
import {
  ArrowRight,
  Brush,
  Eraser,
  Minus,
  MoreHorizontal,
  Palette,
  PenTool,
  Pipette,
  Type,
} from 'lucide-react';
import React from 'react';

import type { ToolItem } from '../types/RadialDockTypes';

// =============================================================================
// MOBILE CONSTANTS
// =============================================================================

/** Height of the expanded toolbar content (2 rows × 44px tools + gaps + padding) */
export const TOOLBAR_HEIGHT_MOBILE = 120;

/** Threshold for drag to trigger open (percentage of toolbar height) */
export const DRAG_OPEN_THRESHOLD = 0.3;

/** Velocity threshold for quick swipe gesture */
export const VELOCITY_THRESHOLD = 300;

/** Minimum drag distance before triggering action */
export const MIN_DRAG_DISTANCE = 20;

/** Mobile breakpoint for device detection */
export const MOBILE_BREAKPOINT = 1024;

// =============================================================================
// DESKTOP LAYOUT CONSTANTS
// =============================================================================

/** Tool: 40px, 9 buttons (8 tools + close), 8 gaps × 6px = 48px, padding 16px = 424px total */
export const TOOLBAR_WIDTH = 424;

/** Floating actions: left: 25px + zoom pill ~180px wide = 205px from left edge */
export const FLOATING_ACTIONS_WIDTH = 210;

/** Minimum canvas width = floating actions (210) + toolbar (424) + right margin (20) = 654px */
export const MIN_CANVAS_WIDTH_FOR_HORIZONTAL = 660;

/** Margin from right edge of canvas (to not touch chat panel) */
export const RIGHT_MARGIN = 20;

/** Default window width fallback for SSR */
export const DEFAULT_WINDOW_WIDTH = 1200;

/** Toolbar bottom position from viewport */
export const TOOLBAR_BOTTOM = 32;

// =============================================================================
// ANIMATION CONSTANTS
// =============================================================================

/** Resize debounce timeout in ms */
export const RESIZE_DEBOUNCE_MS = 100;

// =============================================================================
// TOOL CONFIGURATION
// =============================================================================

/** Shape tools that should trigger shapes satellite active state */
export const SHAPE_TOOLS = [
  TOOLS.SQUARE,
  TOOLS.CIRCLE,
  TOOLS.TRIANGLE,
  TOOLS.PENTAGON,
  TOOLS.HEXAGON,
  TOOLS.STAR,
] as const;

/** Line tools that should trigger lines satellite active state */
export const LINE_TOOLS = [TOOLS.LINE, TOOLS.ARROW, TOOLS.DOTTED_LINE] as const;

/**
 * Configuration for dock tool items - labels are i18n keys under 'board:toolbar.tool' namespace.
 * Tools are ordered by usage frequency and logical workflow:
 * 1. Primary drawing tools (brush, shapes, lines, text)
 * 2. Utility/modification tools (eraser, colors, stroke)
 */
export const DOCK_TOOLS: ToolItem[] = [
  // Primary drawing tools - most frequently used
  {
    tool: TOOLS.BRUSH,
    type: 'direct',
    labelKey: 'brush',
    icon: React.createElement(Brush, { size: 20 }),
  },
  { tool: 'shapes', type: 'satellite', labelKey: 'shapes', isDynamic: true },
  { tool: 'lines', type: 'satellite', labelKey: 'lines', isDynamic: true },
  {
    tool: TOOLS.TEXT,
    type: 'direct',
    labelKey: 'text',
    icon: React.createElement(Type, { size: 20 }),
  },
  // Utility and modification tools
  {
    tool: TOOLS.ERASER,
    type: 'direct',
    labelKey: 'eraser',
    icon: React.createElement(Eraser, { size: 20 }),
  },
  { tool: 'colorPalette', type: 'satellite', labelKey: 'palette', isDynamic: true },
  {
    tool: TOOLS.COLOR_PICKER,
    type: 'direct',
    labelKey: 'colorPicker',
    icon: React.createElement(Pipette, { size: 20 }),
  },
  {
    tool: 'strokeProps',
    type: 'satellite',
    labelKey: 'strokeWidth',
    icon: React.createElement(PenTool, { size: 20 }),
  },
];

// Icon components for dynamic rendering (to avoid creating them inline)
export const TOOL_ICONS = {
  Brush,
  Eraser,
  Type,
  Pipette,
  PenTool,
  Palette,
  Minus,
  ArrowRight,
  MoreHorizontal,
} as const;
