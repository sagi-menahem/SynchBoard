import * as RadixSlider from '@radix-ui/react-slider';
import React from 'react';

import styles from './Slider.module.scss';

/**
 * Props for the Slider component.
 */
interface SliderProps {
  value: number; // Current slider value
  min: number; // Minimum allowed value
  max: number; // Maximum allowed value
  onChange: (value: number) => void; // Callback when value changes
  label?: string; // Optional label for the slider
  className?: string;
  'aria-label'?: string; // Accessibility label
  disabled?: boolean; // Whether slider is disabled
  step?: number; // Step increment for value changes
}

/**
 * Slider input component built on Radix UI primitives.
 * Provides smooth value selection with visual feedback and accessibility features.
 * Displays current value alongside the slider for immediate user feedback.
 * 
 * @param {number} value - Current slider value
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {function} onChange - Callback function called when value changes
 * @param {string} label - Optional label text displayed beside the slider
 * @param {string} className - Optional CSS class to apply to the container
 * @param {string} aria-label - Accessibility label for screen readers
 * @param {boolean} disabled - Whether the slider is disabled and non-interactive
 * @param {number} step - Step increment for discrete value changes
 */
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
