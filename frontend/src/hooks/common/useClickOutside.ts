import { useEffect, RefObject } from 'react';

/**
 * Custom hook to handle click outside events
 * @param ref - React ref object pointing to the element
 * @param callback - Function to call when clicking outside
 * @param isActive - Whether the hook should be active (default: true)
 */
export const useClickOutside = <T extends HTMLElement>(
  ref: RefObject<T>,
  callback: () => void,
  isActive: boolean = true
): void => {
  useEffect(() => {
    if (!isActive) return;

    const handleClickOutside = (event: MouseEvent) => {
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