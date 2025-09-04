import { STROKE_WIDTH_RANGE, TOOLS } from 'features/board/constants/BoardConstants';
import type { CanvasConfig } from 'features/board/types/BoardTypes';
import { Brush, Download, Eraser, PaintBucket, Pipette, Redo, Type, Undo } from 'lucide-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { Tool } from 'shared/types/CommonTypes';
import { ColorPicker, Slider, ToolButton, ToolGroup } from 'shared/ui';
import Button from 'shared/ui/components/forms/Button';
import utilStyles from 'shared/ui/styles/utils.module.scss';

import { useCanvasDownload } from '../../hooks/useCanvasDownload';

import styles from './CanvasToolSection.module.scss';
import { LineToolsDropdown } from './LineToolsDropdown';
import { ShapeToolsDropdown } from './ShapeToolsDropdown';

/**
 * Props interface for CanvasToolSection component.
 * Defines the drawing tools state and interaction handlers for the canvas toolbar.
 */
interface CanvasToolSectionProps {
  /** Name of the board for download filename generation */
  boardName: string;
  /** Current stroke color for drawing operations */
  strokeColor: string;
  /** Handler for stroke color changes */
  setStrokeColor: (color: string) => void;
  /** Current stroke width for drawing operations */
  strokeWidth: number;
  /** Handler for stroke width changes */
  setStrokeWidth: (width: number) => void;
  /** Currently selected drawing tool */
  tool: Tool;
  /** Handler for tool selection changes */
  setTool: (tool: Tool) => void;
  /** Handler for undo operations */
  onUndo: () => void;
  /** Whether undo functionality is currently available */
  isUndoAvailable: boolean;
  /** Handler for redo operations */
  onRedo: () => void;
  /** Whether redo functionality is currently available */
  isRedoAvailable: boolean;
  /** Canvas configuration for download operations */
  canvasConfig?: CanvasConfig;
}

/**
 * Comprehensive toolbar component providing all drawing tools and controls for the canvas.
 * This component organizes drawing tools into logical groups including colors, sizes, shapes,
 * lines, text, history controls, and export functionality with responsive behavior.
 * 
 * @param boardName - Name of the board for download filename generation
 * @param strokeColor - Current stroke color for drawing operations
 * @param setStrokeColor - Handler for stroke color changes
 * @param strokeWidth - Current stroke width for drawing operations
 * @param setStrokeWidth - Handler for stroke width changes
 * @param tool - Currently selected drawing tool
 * @param setTool - Handler for tool selection changes
 * @param onUndo - Handler for undo operations
 * @param isUndoAvailable - Whether undo functionality is currently available
 * @param onRedo - Handler for redo operations
 * @param isRedoAvailable - Whether redo functionality is currently available
 * @param canvasConfig - Canvas configuration for download operations
 */
export const CanvasToolSection: React.FC<CanvasToolSectionProps> = ({
  boardName,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  tool,
  setTool,
  onUndo,
  isUndoAvailable,
  onRedo,
  isRedoAvailable,
  canvasConfig,
}) => {
  const { t } = useTranslation(['board', 'common']);
  const { handleDownload } = useCanvasDownload({ boardName, canvasConfig });

  const handleToolClick = useCallback(
    (toolName: Tool) => {
      if (toolName === TOOLS.DOWNLOAD) {
        handleDownload();
      } else {
        setTool(toolName);
      }
    },
    [handleDownload, setTool],
  );

  return (
    <div className={styles.canvasToolSection}>
      <ToolGroup label={t('board:toolbar.label.color')}>
        <div className={`${styles.colorPickerWrapper} ${utilStyles.colorPickerPopupWrapper}`}>
          <ColorPicker color={strokeColor} onChange={setStrokeColor} />
        </div>
      </ToolGroup>

      {tool !== TOOLS.DOWNLOAD && (
        <ToolGroup label={t('board:toolbar.label.size')}>
          <div className={styles.strokeControl}>
            <Slider
              value={strokeWidth}
              min={tool === TOOLS.TEXT ? 12 : STROKE_WIDTH_RANGE.MIN}
              max={tool === TOOLS.TEXT ? 48 : STROKE_WIDTH_RANGE.MAX}
              onChange={setStrokeWidth}
              aria-label={t('common:accessibility.sizeSlider', { size: strokeWidth })}
            />
          </div>
        </ToolGroup>
      )}

      <ToolGroup label={t('board:toolbar.label.draw')}>
        <ToolButton
          tool={TOOLS.BRUSH}
          currentTool={tool}
          onClick={handleToolClick}
          title={t('board:toolbar.tool.brush')}
        >
          <Brush size={20} />
        </ToolButton>
        <ToolButton
          tool={TOOLS.ERASER}
          currentTool={tool}
          onClick={handleToolClick}
          title={t('board:toolbar.tool.eraser')}
        >
          <Eraser size={20} />
        </ToolButton>
      </ToolGroup>

      <ToolGroup label={t('board:toolbar.label.shapes')}>
        <ShapeToolsDropdown currentTool={tool} onToolSelect={setTool} />
      </ToolGroup>

      <ToolGroup label={t('board:toolbar.label.lines')}>
        <LineToolsDropdown currentTool={tool} onToolSelect={setTool} />
      </ToolGroup>

      <ToolGroup label={t('board:toolbar.label.tools')}>
        <ToolButton
          tool={TOOLS.TEXT}
          currentTool={tool}
          onClick={handleToolClick}
          title={t('board:toolbar.tool.text')}
        >
          <Type size={20} />
        </ToolButton>
        <ToolButton
          tool={TOOLS.COLOR_PICKER}
          currentTool={tool}
          onClick={handleToolClick}
          title={t('board:toolbar.tool.colorPicker')}
        >
          <Pipette size={20} />
        </ToolButton>
        <ToolButton
          tool={TOOLS.RECOLOR}
          currentTool={tool}
          onClick={handleToolClick}
          title={t('board:toolbar.tool.recolor')}
        >
          <PaintBucket size={20} />
        </ToolButton>
      </ToolGroup>

      <ToolGroup label={t('board:toolbar.label.history')}>
        <Button
          variant="icon"
          onClick={onUndo}
          disabled={!isUndoAvailable}
          title={t('board:toolbar.tool.undo')}
        >
          <Undo size={20} />
        </Button>
        <Button
          variant="icon"
          onClick={onRedo}
          disabled={!isRedoAvailable}
          title={t('board:toolbar.tool.redo')}
        >
          <Redo size={20} />
        </Button>
      </ToolGroup>

      <ToolGroup label={t('board:toolbar.label.export')}>
        <Button variant="icon" onClick={handleDownload} title={t('board:toolbar.tool.download')}>
          <Download size={20} />
        </Button>
      </ToolGroup>
    </div>
  );
};
