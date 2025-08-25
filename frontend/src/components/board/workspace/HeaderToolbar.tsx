import { APP_ROUTES, STROKE_WIDTH_RANGE, TOOLS } from 'constants';

import React, { useCallback } from 'react';

import {
  Brush,
  Download,
  Eraser,
  LayoutGrid,
  PaintBucket,
  Pipette,
  Redo,
  Type,
  Undo,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';


import { ColorPicker, Slider } from 'components/common';
import type { Tool } from 'types/CommonTypes';

import styles from './HeaderToolbar.module.css';
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
}) => {
  const { t } = useTranslation();

  const handleDownload = useCallback(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `${boardName}-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [boardName]);

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
        {/* Styling Controls */}
        <div className={styles.toolGroup}>
          <span className={styles.toolLabel}>Style</span>
          <div className={styles.colorPickerWrapper}>
            <ColorPicker
              color={strokeColor}
              onChange={setStrokeColor}
              label={t('toolbar.label.color')}
            />
          </div>
          
          {tool !== TOOLS.COLOR_PICKER && tool !== TOOLS.FILL && tool !== TOOLS.DOWNLOAD && (
            <div className={styles.strokeControl}>
              <Slider
                value={strokeWidth}
                min={tool === TOOLS.TEXT ? 12 : STROKE_WIDTH_RANGE.MIN}
                max={tool === TOOLS.TEXT ? 48 : STROKE_WIDTH_RANGE.MAX}
                onChange={setStrokeWidth}
                label="Size"
                aria-label={`Size: ${strokeWidth}`}
              />
            </div>
          )}
        </div>

        {/* Basic Tools */}
        <div className={styles.toolGroup}>
          <span className={styles.toolLabel}>Draw</span>
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

        {/* Shape Tools */}
        <div className={styles.toolGroup}>
          <span className={styles.toolLabel}>Shapes</span>
          <ShapeToolsDropdown
            currentTool={tool}
            onToolSelect={setTool}
          />
        </div>

        {/* Special Tools */}
        <div className={styles.toolGroup}>
          <span className={styles.toolLabel}>Tools</span>
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
            className={`${styles.iconButton} ${tool === TOOLS.FILL ? styles.active : ''}`}
            onClick={() => handleToolClick(TOOLS.FILL)}
            title={t('toolbar.tool.fill')}
          >
            <PaintBucket size={20} />
          </button>
        </div>

        {/* History */}
        <div className={styles.toolGroup}>
          <span className={styles.toolLabel}>History</span>
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

        {/* Actions */}
        <div className={styles.toolGroup}>
          <span className={styles.toolLabel}>Export</span>
          <button
            className={styles.iconButton}
            onClick={handleDownload}
            title={t('toolbar.tool.download')}
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Right Section: Navigation */}
      <div className={styles.navigationSection}>
        <Link to={APP_ROUTES.BOARD_LIST} className={styles.backButton}>
          <LayoutGrid size={16} />
          <span>Boards</span>
        </Link>
        
        <Link 
          to={APP_ROUTES.getBoardDetailsRoute(boardId)} 
          className={styles.boardName}
        >
          {boardName}
        </Link>
      </div>
    </div>
  );
};