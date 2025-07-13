// File: frontend/src/components/board/Toolbar.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import { TOOL_LIST, STROKE_WIDTH_RANGE } from '../../constants/board.constants';

// The Tool type can now be more robustly defined
type Tool = typeof TOOL_LIST[number];

interface ToolbarProps {
    strokeColor: string;
    setStrokeColor: (color: string) => void;
    strokeWidth: number;
    setStrokeWidth: (width: number) => void;
    tool: Tool;
    setTool: (tool: Tool) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    tool,
    setTool,
}) => {
    const { t } = useTranslation();

    return (
        <div style={toolbarStyle}>
            <label style={labelStyle}>
                {t('toolbar.label.color')}
                <input 
                    type="color" 
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    style={colorInputStyle}
                />
            </label>

            <label style={labelStyle}>
                {t('toolbar.label.lineWidth', { width: strokeWidth })}
                <input
                    type="range"
                    min={STROKE_WIDTH_RANGE.MIN}
                    max={STROKE_WIDTH_RANGE.MAX}
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(parseInt(e.target.value, 10))}
                    style={{ ...inputStyle, width: '100px' }}
                />
            </label>
            
            <div style={toolsContainerStyle}>
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
        </div>
    );
};


// Styles
const toolbarStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#2d2d2d',
    padding: '8px 12px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    border: '1px solid #444',
    zIndex: 10
};

const labelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '0.8rem',
    color: '#ccc',
};

const inputStyle: React.CSSProperties = {
    marginTop: '4px',
};

const colorInputStyle: React.CSSProperties = {
    ...inputStyle,
    padding: 0,
    border: 'none',
    width: '30px',
    height: '30px',
    background: 'none',
}

const toolsContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    borderLeft: '1px solid #555',
    paddingLeft: '1.5rem',
}

export default Toolbar;