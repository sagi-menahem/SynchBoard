import { useCallback, useState } from 'react';

/**
 * Return type for useModalState hook providing modal visibility state and control functions.
 */
export interface UseModalStateReturn {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Opens the modal */
  open: () => void;
  /** Closes the modal */
  close: () => void;
  /** Toggles the modal open/closed state */
  toggle: () => void;
  /** Sets the modal state directly (for compatibility with existing setState patterns) */
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Custom hook for managing modal/dialog visibility state with memoized handlers.
 * Provides a consistent pattern for modal open/close operations throughout the application.
 * All handler functions are memoized via useCallback to prevent unnecessary re-renders
 * when passed as props to child components.
 *
 * @param initialState - Initial open state of the modal (default: false)
 * @returns Object containing isOpen state and memoized control functions
 *
 * @example
 * ```tsx
 * const deleteModal = useModalState();
 *
 * return (
 *   <>
 *     <button onClick={deleteModal.open}>Delete</button>
 *     <ConfirmationDialog
 *       isOpen={deleteModal.isOpen}
 *       onClose={deleteModal.close}
 *       onConfirm={handleDelete}
 *     />
 *   </>
 * );
 * ```
 */
export const useModalState = (initialState: boolean = false): UseModalStateReturn => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
};
