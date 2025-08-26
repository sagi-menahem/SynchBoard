import { APP_ROUTES, STROKE_WIDTH_RANGE, TOOLS } from 'constants';

import React, { useCallback } from 'react';

import {
  ArrowRight,
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
import { Link } from 'react-router-dom';


import { ColorPicker, Slider } from 'components/common';
import type { CanvasConfig } from 'types/BoardTypes';
import type { Tool } from 'types/CommonTypes';

import styles from './HeaderToolbar.module.css';
import { LineToolsDropdown } from './LineToolsDropdown';
import { ShapeToolsDropdown } from './ShapeToolsDropdown';

interface HeaderToolbarProps {
  boardId: number;
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

export const HeaderToolbar: React.FC<HeaderToolbarProps> = ({
  boardId,
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
  const { t } = useTranslation();

  const handleDownload = useCallback(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create a temporary canvas to draw the background + content
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) return;

    // Fill background color
    const backgroundColor = canvasConfig?.backgroundColor || '#FFFFFF';
    tempCtx.fillStyle = backgroundColor;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw the existing canvas content on top of the background
    tempCtx.drawImage(canvas, 0, 0);
    
    // Create download link using the temporary canvas
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
    <div className={styles.headerToolbar}>
      {/* Left Section: Tool Controls */}
      <div className={styles.toolSection}>
        {/* Color Control */}
        <div className={styles.toolGroup}>
          <div className={styles.toolControls}>
            <div className={styles.colorPickerWrapper}>
              <ColorPicker
                color={strokeColor}
                onChange={setStrokeColor}
              />
            </div>
          </div>
          <span className={styles.toolLabel}>{t('toolbar.label.color')}</span>
        </div>

        {/* Size Control */}
        {tool !== TOOLS.COLOR_PICKER && tool !== TOOLS.RECOLOR && tool !== TOOLS.DOWNLOAD && (
          <div className={styles.toolGroup}>
            <div className={styles.toolControls}>
              <div className={styles.strokeControl}>
                <Slider
                  value={strokeWidth}
                  min={tool === TOOLS.TEXT ? 12 : STROKE_WIDTH_RANGE.MIN}
                  max={tool === TOOLS.TEXT ? 48 : STROKE_WIDTH_RANGE.MAX}
                  onChange={setStrokeWidth}
                  aria-label={`Size: ${strokeWidth}`}
                />
              </div>
            </div>
            <span className={styles.toolLabel}>{t('toolbar.label.size')}</span>
          </div>
        )}

        {/* Basic Tools */}
        <div className={styles.toolGroup}>
          <div className={styles.toolControls}>
            <button
              className={`${styles.iconButton} ${tool === TOOLS.BRUSH ? styles.active : ''}`}
              onClick={() => handleToolClick(TOOLS.BRUSH)}
              title={t('toolbar.tool.brush')}
            >
              <Brush size={20} />
            </button>
            <button
              className={`${styles.iconButton} ${tool === TOOLS.ERASER ? styles.active : ''}`}
              onClick={() => handleToolClick(TOOLS.ERASER)}
              title={t('toolbar.tool.eraser')}
            >
              <Eraser size={20} />
            </button>
          </div>
          <span className={styles.toolLabel}>{t('toolbar.label.draw')}</span>
        </div>

        {/* Shape Tools */}
        <div className={styles.toolGroup}>
          <div className={styles.toolControls}>
            <ShapeToolsDropdown
              currentTool={tool}
              onToolSelect={setTool}
            />
          </div>
          <span className={styles.toolLabel}>{t('toolbar.label.shapes')}</span>
        </div>

        {/* Line Tools */}
        <div className={styles.toolGroup}>
          <div className={styles.toolControls}>
            <LineToolsDropdown
              currentTool={tool}
              onToolSelect={setTool}
            />
          </div>
          <span className={styles.toolLabel}>{t('toolbar.label.lines')}</span>
        </div>

        {/* Special Tools */}
        <div className={styles.toolGroup}>
          <div className={styles.toolControls}>
            <button
              className={`${styles.iconButton} ${tool === TOOLS.TEXT ? styles.active : ''}`}
              onClick={() => handleToolClick(TOOLS.TEXT)}
              title={t('toolbar.tool.text')}
            >
              <Type size={20} />
            </button>
            <button
              className={`${styles.iconButton} ${tool === TOOLS.COLOR_PICKER ? styles.active : ''}`}
              onClick={() => handleToolClick(TOOLS.COLOR_PICKER)}
              title={t('toolbar.tool.colorPicker')}
            >
              <Pipette size={20} />
            </button>
            <button
              className={`${styles.iconButton} ${tool === TOOLS.RECOLOR ? styles.active : ''}`}
              onClick={() => handleToolClick(TOOLS.RECOLOR)}
              title={t('toolbar.tool.recolor')}
            >
              <PaintBucket size={20} />
            </button>
          </div>
          <span className={styles.toolLabel}>{t('toolbar.label.tools')}</span>
        </div>

        {/* History */}
        <div className={styles.toolGroup}>
          <div className={styles.toolControls}>
            <button
              className={styles.iconButton}
              onClick={onUndo}
              disabled={!isUndoAvailable}
              title={t('toolbar.tool.undo')}
            >
              <Undo size={20} />
            </button>
            <button
              className={styles.iconButton}
              onClick={onRedo}
              disabled={!isRedoAvailable}
              title={t('toolbar.tool.redo')}
            >
              <Redo size={20} />
            </button>
          </div>
          <span className={styles.toolLabel}>{t('toolbar.label.history')}</span>
        </div>

        {/* Actions */}
        <div className={styles.toolGroup}>
          <div className={styles.toolControls}>
            <button
              className={styles.iconButton}
              onClick={handleDownload}
              title={t('toolbar.tool.download')}
            >
              <Download size={20} />
            </button>
          </div>
          <span className={styles.toolLabel}>{t('toolbar.label.export')}</span>
        </div>
      </div>

      {/* Right Section: Navigation */}
      <div className={styles.navigationSection}>
        <Link 
          to={APP_ROUTES.getBoardDetailsRoute(boardId)} 
          className={styles.boardName}
        >
          {boardName}
        </Link>
        
        <Link to={APP_ROUTES.BOARD_LIST} className={styles.backButton}>
          <span>{t('toolbar.label.BackToBoards')}</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};