import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DesktopToolbar, MobileToolbar } from './components';
import { DOCK_TOOLS } from './constants';
import { useMobileDragGesture, useRadialDockState, useToolbarPosition } from './hooks';
import styles from './RadialDock.module.scss';
import { SatelliteManager } from './SatelliteManager';
import type { RadialDockProps, ToolItem } from './types';
import { checkIsToolActive, createToolIcon, getActiveToolIcon } from './utils';


// =============================================================================
// COMPONENT
// =============================================================================

/**
 * RadialDock - Main toolbar component for the drawing canvas.
 *
 * Features:
 * - Mobile: Bottom sheet with drag gesture support
 * - Desktop: Horizontal or vertical layout based on canvas size
 * - RTL support for right-to-left languages
 * - Satellite sub-menus for shapes, lines, colors, and stroke width
 *
 * Architecture:
 * - useRadialDockState: Core state management (expansion, satellite, preferences)
 * - useToolbarPosition: Desktop positioning calculations
 * - useMobileDragGesture: Mobile drag gesture handling
 * - MobileToolbar/DesktopToolbar: Platform-specific rendering
 */
export const RadialDock: React.FC<RadialDockProps> = ({
  onSatelliteChange,
  canvasSplitRatio = 70,
  isChatOpen = true,
}) => {
  // =========================================================================
  // HOOKS
  // =========================================================================

  const { t } = useTranslation(['board']);
  const { state, actions, preferences, updateDockMinimized } =
    useRadialDockState(onSatelliteChange);

  const { canvasWidthPx, useVerticalLayout, toolbarStyle } = useToolbarPosition({
    isMobile: state.isMobile,
    isChatOpen,
    canvasSplitRatio,
    isRTLMode: state.isRTLMode,
  });

  const { isDragging, dragY, toolbarHeight, dragHandlers } = useMobileDragGesture({
    isMobile: state.isMobile,
    isExpanded: state.isExpanded,
    setIsExpanded: actions.setIsExpanded,
    setActiveSatellite: actions.setActiveSatellite,
    updateDockMinimized,
  });

  // =========================================================================
  // RENDER HELPERS
  // =========================================================================

  const getToolIcon = useCallback(
    (item: ToolItem, size = 20): React.ReactNode => {
      return createToolIcon(item, preferences.defaultTool, preferences.defaultStrokeColor, size);
    },
    [preferences.defaultTool, preferences.defaultStrokeColor],
  );

  const isToolActive = useCallback(
    (item: ToolItem): boolean => {
      return checkIsToolActive(item, preferences.defaultTool);
    },
    [preferences.defaultTool],
  );

  const activeToolIcon = useMemo(() => {
    return getActiveToolIcon(
      DOCK_TOOLS,
      preferences.defaultTool,
      preferences.defaultStrokeColor,
      getToolIcon,
    );
  }, [preferences.defaultTool, preferences.defaultStrokeColor, getToolIcon]);

  const getToolLabel = useCallback(
    (labelKey: string): string => t(`board:toolbar.tool.${labelKey}`),
    [t],
  );

  const collapseLabel = t('board:toolbar.collapse');

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <>
      <div
        className={`${styles.fixedToolbar} ${state.isMobile ? styles.mobile : styles.desktop} ${useVerticalLayout ? styles.vertical : ''}`}
        style={toolbarStyle}
      >
        {state.isMobile ? (
          <MobileToolbar
            isExpanded={state.isExpanded}
            isDragging={isDragging}
            dragY={dragY}
            toolbarHeight={toolbarHeight}
            activeSatellite={state.activeSatellite}
            activeToolIcon={activeToolIcon}
            defaultTool={preferences.defaultTool}
            defaultStrokeColor={preferences.defaultStrokeColor}
            onToggleExpand={actions.handleToggleExpand}
            onToolSelect={actions.handleToolSelect}
            onOpenSatellite={actions.handleOpenSatellite}
            dragHandlers={dragHandlers}
            getToolIcon={getToolIcon}
            isToolActive={isToolActive}
            getToolLabel={getToolLabel}
          />
        ) : (
          <DesktopToolbar
            isExpanded={state.isExpanded}
            useVerticalLayout={useVerticalLayout}
            toolbarStyle={toolbarStyle}
            activeSatellite={state.activeSatellite}
            activeToolIcon={activeToolIcon}
            defaultTool={preferences.defaultTool}
            defaultStrokeColor={preferences.defaultStrokeColor}
            onToggleExpand={actions.handleToggleExpand}
            onToolSelect={actions.handleToolSelect}
            onOpenSatellite={actions.handleOpenSatellite}
            getToolIcon={getToolIcon}
            isToolActive={isToolActive}
            getToolLabel={getToolLabel}
            collapseLabel={collapseLabel}
          />
        )}
      </div>

      {/* Satellite Manager - Rendered outside toolbar to avoid transform context issues */}
      <SatelliteManager
        activeSatellite={state.activeSatellite}
        onClose={() => actions.setActiveSatellite(null)}
        isMobile={state.isMobile}
        isVerticalLayout={useVerticalLayout}
        canvasWidthPx={canvasWidthPx}
        toolbarStyle={toolbarStyle}
      />
    </>
  );
};

export default RadialDock;
