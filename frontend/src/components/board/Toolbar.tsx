// File: frontend/src/components/board/Toolbar.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';

type Tool = 'brush' | 'eraser' | 'rectangle' | 'circle';

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
    const tools: Tool[] = ['brush', 'rectangle', 'circle', 'eraser'];

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
                    min="1"
                    max="50"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(parseInt(e.target.value, 10))}
                    style={{ ...inputStyle, width: '100px' }}
                />
            </label>
            
            <div style={toolsContainerStyle}>
                {tools.map(toolName => (
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