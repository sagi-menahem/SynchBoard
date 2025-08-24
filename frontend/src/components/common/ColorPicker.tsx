import React, { useState, useRef, useEffect } from 'react';

import { SketchPicker } from 'react-color';
import type { ColorResult } from 'react-color';

import styles from './ColorPicker.module.css';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  color, 
  onChange, 
  disabled = false,
  className = '',
  label
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const swatchRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(event.target as Node) &&
        swatchRef.current &&
        !swatchRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showPicker]);

  const handleSwatchClick = () => {
    if (!disabled) {
      setShowPicker(!showPicker);
    }
  };

  const handleColorChange = (colorResult: ColorResult) => {
    onChange(colorResult.hex);
  };

  return (
    <div className={`${styles.colorPickerContainer} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <button
        ref={swatchRef}
        type="button"
        className={`${styles.swatch} ${disabled ? styles.disabled : ''}`}
        onClick={handleSwatchClick}
        disabled={disabled}
        aria-label={label || 'Choose color'}
        style={{ backgroundColor: color }}
      >
        <div className={styles.swatchInner} />
      </button>
      
      {showPicker && !disabled && (
        <div ref={pickerRef} className={styles.popover}>
          <SketchPicker 
            color={color} 
            onChange={handleColorChange}
            disableAlpha={true}
            presetColors={[
              '#FFFFFF', '#F8F8F8', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575',
              '#000000', '#2F2F2F', '#424242', '#616161', '#757575', '#9E9E9E',
              '#D32F2F', '#F44336', '#FF5252', '#E91E63', '#FF4081', '#F50057',
              '#9C27B0', '#BA68C8', '#E040FB', '#7B1FA2', '#AA00FF', '#D500F9',
              '#673AB7', '#7E57C2', '#B388FF', '#512DA8', '#651FFF', '#7C4DFF',
              '#3F51B5', '#5C6BC0', '#536DFE', '#303F9F', '#3D5AFE', '#448AFF',
              '#2196F3', '#42A5F5', '#2979FF', '#1976D2', '#2962FF', '#0091EA',
              '#00BCD4', '#26C6DA', '#00E5FF', '#0097A7', '#00B8D4', '#00E5FF',
              '#009688', '#26A69A', '#1DE9B6', '#00897B', '#00BFA5', '#00E676',
              '#4CAF50', '#66BB6A', '#69F0AE', '#388E3C', '#00C853', '#00E676',
              '#8BC34A', '#9CCC65', '#B2FF59', '#689F38', '#76FF03', '#C6FF00',
              '#CDDC39', '#D4E157', '#EEFF41', '#AFB42B', '#AEEA00', '#FFD600',
              '#FFEB3B', '#FFF176', '#FFFF00', '#FBC02D', '#FFD600', '#FFAB00',
              '#FFC107', '#FFD54F', '#FFC400', '#FFA000', '#FFAB00', '#FF6F00',
              '#FF9800', '#FFB74D', '#FF9100', '#F57C00', '#FF6D00', '#DD2C00',
              '#FF5722', '#FF8A65', '#FF3D00', '#E64A19', '#DD2C00', '#BF360C',
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;