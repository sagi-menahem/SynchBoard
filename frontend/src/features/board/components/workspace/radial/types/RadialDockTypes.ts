import type { PanInfo } from 'framer-motion';

import type { Tool } from 'shared/types/CommonTypes';

/**
 * Props for the RadialDock component.
 */
export interface RadialDockProps {
  /** Callback when satellite state changes (for coordinating with FloatingActions on mobile) */
  onSatelliteChange?: (satelliteType: string | null) => void;
  /** Canvas split ratio percentage (0-100) - used to position toolbar relative to canvas area on desktop */
  canvasSplitRatio?: number;
  /** Whether chat panel is open - affects toolbar positioning on desktop */
  isChatOpen?: boolean;
}

/**
 * Configuration for a tool item in the dock.
 */
export interface ToolItem {
  tool: Tool | string;
  type: 'direct' | 'satellite';
  /** i18n key for the tool label (under 'board:toolbar.tool' namespace) */
  labelKey: string;
  icon?: React.ReactNode;
  /** Flag to indicate if icon should be generated dynamically */
  isDynamic?: boolean;
}

/**
 * State returned by useRadialDockState hook.
 */
export interface RadialDockState {
  isMobile: boolean;
  isExpanded: boolean;
  activeSatellite: string | null;
  isDragging: boolean;
  dragY: number;
  windowWidth: number;
  isRTLMode: boolean;
}

/**
 * Actions returned by useRadialDockState hook.
 */
export interface RadialDockActions {
  setIsExpanded: (expanded: boolean) => void;
  setActiveSatellite: (satellite: string | null) => void;
  handleToggleExpand: () => void;
  handleToolSelect: (tool: Tool) => void;
  handleOpenSatellite: (satelliteType: string) => void;
}

/**
 * Drag handlers returned by useMobileDragGesture hook.
 */
export interface MobileDragHandlers {
  handleDragStart: () => void;
  handleDrag: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  handleDragEnd: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
}

/**
 * Props for MobileToolbar component.
 */
export interface MobileToolbarProps {
  isExpanded: boolean;
  isDragging: boolean;
  dragY: number;
  toolbarHeight: number;
  activeSatellite: string | null;
  activeToolIcon: React.ReactNode;
  defaultTool: Tool;
  defaultStrokeColor: string;
  onToggleExpand: () => void;
  onToolSelect: (tool: Tool) => void;
  onOpenSatellite: (satelliteType: string) => void;
  dragHandlers: MobileDragHandlers;
  getToolIcon: (item: ToolItem, size?: number) => React.ReactNode;
  isToolActive: (item: ToolItem) => boolean;
  /** Translate tool label key to localized string */
  getToolLabel: (labelKey: string) => string;
}

/**
 * Props for DesktopToolbar component.
 */
export interface DesktopToolbarProps {
  isExpanded: boolean;
  useVerticalLayout: boolean;
  toolbarStyle: React.CSSProperties;
  activeSatellite: string | null;
  activeToolIcon: React.ReactNode;
  defaultTool: Tool;
  defaultStrokeColor: string;
  onToggleExpand: () => void;
  onToolSelect: (tool: Tool) => void;
  onOpenSatellite: (satelliteType: string) => void;
  getToolIcon: (item: ToolItem, size?: number) => React.ReactNode;
  isToolActive: (item: ToolItem) => boolean;
  /** Translate tool label key to localized string */
  getToolLabel: (labelKey: string) => string;
  /** Translated label for "Collapse toolbar" */
  collapseLabel: string;
}
