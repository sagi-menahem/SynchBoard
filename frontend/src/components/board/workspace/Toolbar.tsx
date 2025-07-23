// File: frontend/src/components/board/Toolbar.tsx
import Button from 'components/common/Button';
import { STROKE_WIDTH_RANGE, TOOL_LIST } from 'constants/board.constants';
import { useDraggable } from 'hooks/useDraggable';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Toolbar.module.css';

type Tool = typeof TOOL_LIST[number];

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

    return (
        <div
            ref={draggableRef}
            className={styles.toolbar}
            onMouseDown={handleMouseDown}
            style={draggableStyle}
        >
            <label className={styles.label}>
                {t('toolbar.label.color')}
                <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
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
                    onChange={(e) => setStrokeWidth(parseInt(e.target.value, 10))}
                    className={styles.rangeInput}
                />
            </label>

            <div className={styles.toolsContainer}>
                {TOOL_LIST.map(toolName => (
                    <Button
                        key={toolName}
                        variant={tool === toolName ? 'primary' : 'secondary'}
                        onClick={() => setTool(toolName)}
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

export default Toolbar;