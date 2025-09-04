import React from 'react';

import * as RadixSlider from '@radix-ui/react-slider';

import styles from './Slider.module.scss';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
  'aria-label'?: string;
  disabled?: boolean;
  step?: number;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  onChange,
  label,
  className = '',
  'aria-label': ariaLabel,
  disabled = false,
  step = 1,
}) => {
  const handleValueChange = (values: number[]) => {
    onChange(values[0]);
  };

  return (
    <div className={`${styles.sliderContainer} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.sliderWrapper}>
        <RadixSlider.Root
          className={styles.sliderRoot}
          value={[value]}
          onValueChange={handleValueChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-label={ariaLabel ?? label}
        >
          <RadixSlider.Track className={styles.sliderTrack}>
            <RadixSlider.Range className={styles.sliderRange} />
          </RadixSlider.Track>
          <RadixSlider.Thumb className={styles.sliderThumb} />
        </RadixSlider.Root>
        <span className={styles.value}>{value}</span>
      </div>
    </div>
  );
};
