// File: frontend/src/components/board/Toolbar.tsx

import React from 'react';

// 1. Update the type definition for the tool prop
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

  return (
    <div style={toolbarStyle}>
      <label style={labelStyle}>
        Color
        <input 
          type="color" 
          value={strokeColor}
          onChange={(e) => setStrokeColor(e.target.value)}
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        Line Width: {strokeWidth}
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
        <button 
          style={{ ...buttonStyle, ...(tool === 'brush' ? activeButtonStyle : {}) }}
          onClick={() => setTool('brush')}
        >
            Brush
        </button>
        <button 
          style={{ ...buttonStyle, ...(tool === 'rectangle' ? activeButtonStyle : {}) }}
          onClick={() => setTool('rectangle')}
        >
            Rectangle
        </button>
        {/* 2. Add the new Circle tool button */}
        <button 
          style={{ ...buttonStyle, ...(tool === 'circle' ? activeButtonStyle : {}) }}
          onClick={() => setTool('circle')}
        >
            Circle
        </button>
        <button 
          style={{ ...buttonStyle, ...(tool === 'eraser' ? activeButtonStyle : {}) }}
          onClick={() => setTool('eraser')}
        >
            Eraser
        </button>
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

const toolsContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px'
}

const buttonStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: '1px solid #555',
    borderRadius: '4px',
    backgroundColor: '#3f3f3f',
    color: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
};

const activeButtonStyle: React.CSSProperties = {
    backgroundColor: '#646cff',
    borderColor: '#8186ff',
};

export default Toolbar;