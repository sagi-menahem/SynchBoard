import { useEffect, type RefObject } from 'react';

/**
 * Custom hook for detecting clicks outside a referenced DOM element.
 * Commonly used for closing dropdowns, modals, or popover components when
 * users click outside of them. Provides an optional activation flag for
 * conditional behavior.
 *
 * @param {RefObject<T | null>} ref - React ref to the target element to monitor
 * @param {() => void} callback - Function to execute when click outside is detected
 * @param {boolean} isActive - Whether the click outside detection is active (default: true)
 */
export const useClickOutside = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  callback: () => void,
  isActive = true,
): void => {
  useEffect(() => {
    if (!isActive) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      // Check if click target exists outside the referenced element
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback, isActive]);
};
