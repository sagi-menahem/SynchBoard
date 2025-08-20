import { STROKE_WIDTH_RANGE, TOOL_LIST } from 'constants';

import React, { useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { Button } from 'components/common';
import { useDraggable } from 'hooks/common';
import type { Tool } from 'types/CommonTypes';

import styles from './Toolbar.module.css';

interface ToolbarProps {
    containerRef: React.RefObject<HTMLElement | null>;
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

const Toolbar: React.FC<ToolbarProps> = ({
    containerRef,
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
    const { draggableRef, handleMouseDown, style: draggableStyle } = useDraggable({ containerRef });

    // Memoize event handlers to prevent child re-renders
    const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setStrokeColor(e.target.value);
    }, [setStrokeColor]);

    const handleWidthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setStrokeWidth(parseInt(e.target.value, 10));
    }, [setStrokeWidth]);

    const createToolClickHandler = useCallback((toolName: Tool) => {
        return () => setTool(toolName);
    }, [setTool]);

    return (
        <div
            ref={draggableRef}
            className={styles.toolbar}
            onMouseDown={handleMouseDown}
            style={draggableStyle}
            role="toolbar"
            aria-label={t('toolbar.ariaLabel')}
        >
            <label className={styles.label}>
                {t('toolbar.label.color')}
                <input
                    type="color"
                    value={strokeColor}
                    onChange={handleColorChange}
                    className={styles.colorInput}
                />
            </label>

            <label className={styles.label}>
                {t('toolbar.label.lineWidth', { width: strokeWidth })}
                <input
                    type="range"
                    min={STROKE_WIDTH_RANGE.MIN}
                    max={STROKE_WIDTH_RANGE.MAX}
                    value={strokeWidth}
                    onChange={handleWidthChange}
                    className={styles.rangeInput}
                />
            </label>

            <div className={styles.toolsContainer}>
                {TOOL_LIST.map((toolName) => (
                    <Button
                        key={toolName}
                        variant={tool === toolName ? 'primary' : 'secondary'}
                        onClick={createToolClickHandler(toolName)}
                    >
                        {t(`toolbar.tool.${toolName}`)}
                    </Button>
                ))}
            </div>

            <div className={styles.toolsContainer}>
                <Button onClick={onUndo} disabled={!isUndoAvailable} variant="secondary">
                    {t('toolbar.tool.undo')}
                </Button>
                <Button onClick={onRedo} disabled={!isRedoAvailable} variant="secondary">
                    {t('toolbar.tool.redo')}
                </Button>
            </div>
        </div>
    );
};

export default React.memo(Toolbar);
