
import React, { useCallback } from 'react';

import { STROKE_WIDTH_RANGE, TOOLS } from 'features/board/constants/BoardConstants';
import type { CanvasConfig } from 'features/board/types/BoardTypes';
import {
  Brush,
  Download,
  Eraser,
  PaintBucket,
  Pipette,
  Redo,
  Type,
  Undo,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Tool } from 'shared/types/CommonTypes';
import { ColorPicker, Slider } from 'shared/ui';

import styles from './CanvasToolSection.module.scss';
import { LineToolsDropdown } from './LineToolsDropdown';
import { ShapeToolsDropdown } from './ShapeToolsDropdown';

interface CanvasToolSectionProps {
  boardName: string;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  tool: Tool;
  setTool: (tool: Tool) => void;
  onUndo: () => void;
  isUndoAvailable: boolean;
  onRedo: () => void;
  isRedoAvailable: boolean;
  canvasConfig?: CanvasConfig;
}

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

  const handleDownload = useCallback(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) {return;}
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {return;}

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) {return;}

    const backgroundColor = canvasConfig?.backgroundColor ?? '#FFFFFF';
    tempCtx.fillStyle = backgroundColor;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    tempCtx.drawImage(canvas, 0, 0);
    
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `${boardName}-${timestamp}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  }, [boardName, canvasConfig]);

  const handleToolClick = useCallback((toolName: Tool) => {
    if (toolName === TOOLS.DOWNLOAD) {
      handleDownload();
    } else {
      setTool(toolName);
    }
  }, [handleDownload, setTool]);

  return (
    <div className={styles.canvasToolSection}>
      <div className={styles.toolGroup}>
        <div className={styles.toolControls}>
          <div className={styles.colorPickerWrapper}>
            <ColorPicker
              color={strokeColor}
              onChange={setStrokeColor}
            />
          </div>
        </div>
        <span className={styles.toolLabel}>{t('board:toolbar.label.color')}</span>
      </div>

      {tool !== TOOLS.DOWNLOAD && (
        <div className={styles.toolGroup}>
          <div className={styles.toolControls}>
            <div className={styles.strokeControl}>
              <Slider
                value={strokeWidth}
                min={tool === TOOLS.TEXT ? 12 : STROKE_WIDTH_RANGE.MIN}
                max={tool === TOOLS.TEXT ? 48 : STROKE_WIDTH_RANGE.MAX}
                onChange={setStrokeWidth}
                aria-label={t('common:accessibility.sizeSlider', { size: strokeWidth })}
              />
            </div>
          </div>
          <span className={styles.toolLabel}>{t('board:toolbar.label.size')}</span>
        </div>
      )}

      <div className={styles.toolGroup}>
        <div className={styles.toolControls}>
          <button
            className={`${styles.iconButton} ${tool === TOOLS.BRUSH ? styles.active : ''}`}
            onClick={() => handleToolClick(TOOLS.BRUSH)}
            title={t('board:toolbar.tool.brush')}
          >
            <Brush size={20} />
          </button>
          <button
            className={`${styles.iconButton} ${tool === TOOLS.ERASER ? styles.active : ''}`}
            onClick={() => handleToolClick(TOOLS.ERASER)}
            title={t('board:toolbar.tool.eraser')}
          >
            <Eraser size={20} />
          </button>
        </div>
        <span className={styles.toolLabel}>{t('board:toolbar.label.draw')}</span>
      </div>

      <div className={styles.toolGroup}>
        <div className={styles.toolControls}>
          <ShapeToolsDropdown
            currentTool={tool}
            onToolSelect={setTool}
          />
        </div>
        <span className={styles.toolLabel}>{t('board:toolbar.label.shapes')}</span>
      </div>

      <div className={styles.toolGroup}>
        <div className={styles.toolControls}>
          <LineToolsDropdown
            currentTool={tool}
            onToolSelect={setTool}
          />
        </div>
        <span className={styles.toolLabel}>{t('board:toolbar.label.lines')}</span>
      </div>

      <div className={styles.toolGroup}>
        <div className={styles.toolControls}>
          <button
            className={`${styles.iconButton} ${tool === TOOLS.TEXT ? styles.active : ''}`}
            onClick={() => handleToolClick(TOOLS.TEXT)}
            title={t('board:toolbar.tool.text')}
          >
            <Type size={20} />
          </button>
          <button
            className={`${styles.iconButton} ${tool === TOOLS.COLOR_PICKER ? styles.active : ''}`}
            onClick={() => handleToolClick(TOOLS.COLOR_PICKER)}
            title={t('board:toolbar.tool.colorPicker')}
          >
            <Pipette size={20} />
          </button>
          <button
            className={`${styles.iconButton} ${tool === TOOLS.RECOLOR ? styles.active : ''}`}
            onClick={() => handleToolClick(TOOLS.RECOLOR)}
            title={t('board:toolbar.tool.recolor')}
          >
            <PaintBucket size={20} />
          </button>
        </div>
        <span className={styles.toolLabel}>{t('board:toolbar.label.tools')}</span>
      </div>

      <div className={styles.toolGroup}>
        <div className={styles.toolControls}>
          <button
            className={styles.iconButton}
            onClick={onUndo}
            disabled={!isUndoAvailable}
            title={t('board:toolbar.tool.undo')}
          >
            <Undo size={20} />
          </button>
          <button
            className={styles.iconButton}
            onClick={onRedo}
            disabled={!isRedoAvailable}
            title={t('board:toolbar.tool.redo')}
          >
            <Redo size={20} />
          </button>
        </div>
        <span className={styles.toolLabel}>{t('board:toolbar.label.history')}</span>
      </div>

      <div className={styles.toolGroup}>
        <div className={styles.toolControls}>
          <button
            className={styles.iconButton}
            onClick={handleDownload}
            title={t('board:toolbar.tool.download')}
          >
            <Download size={20} />
          </button>
        </div>
        <span className={styles.toolLabel}>{t('board:toolbar.label.export')}</span>
      </div>
    </div>
  );
};