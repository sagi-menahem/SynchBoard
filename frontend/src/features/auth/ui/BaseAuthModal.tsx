import React, { type ReactNode } from 'react';

import { UI_CONSTANTS } from 'shared/constants/UIConstants';
import { Button, Modal } from 'shared/ui';
import styles from 'shared/ui/styles/CommonForm.module.scss';

/**
 * Properties for the BaseAuthModal component defining modal behavior and content.
 * Supports flexible form submission, loading states, and additional action areas.
 */
interface BaseAuthModalProps {
  // Modal visibility and close behavior control
  isOpen: boolean;
  onClose: () => void;
  // Modal header content and optional description text
  title: string;
  description?: string;
  // Form submission handler and loading state management
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
  // Button text customization for different authentication contexts
  submitButtonText: string;
  cancelButtonText: string;
  // Form fields and additional action area content
  children: ReactNode;
  additionalActions?: ReactNode;
  // Optional modal width override from default authentication modal size
  maxWidth?: string;
}

/**
 * Reusable modal foundation for authentication-related forms and dialogs.
 * Provides consistent layout, styling, and behavior patterns for login, registration,
 * email verification, and password reset modals. Handles form submission states,
 * loading indicators, and standardized button arrangements.
 * 
 * Key features:
 * - Consistent modal header with title and optional description
 * - Form wrapper with submit/cancel button standardization
 * - Loading state management disabling interactions during API calls
 * - Flexible content area for different form types via children prop
 * - Optional additional actions area for secondary operations like resend codes
 * - Configurable modal width with authentication-optimized default sizing
 */
const BaseAuthModal: React.FC<BaseAuthModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  onSubmit,
  isPending,
  submitButtonText,
  cancelButtonText,
  children,
  additionalActions,
  // Default to standard auth modal width unless overridden for specific use cases
  maxWidth = UI_CONSTANTS.AUTH_MODAL_MAX_WIDTH,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContainer} style={{ maxWidth }}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
        </div>

        {description && <p className={styles.modalDescription}>{description}</p>}

        <form onSubmit={onSubmit} className={styles.form}>
          {children}

          <div className={styles.buttonGroup}>
            <Button type="button" onClick={onClose} disabled={isPending} variant="secondary">
              {cancelButtonText}
            </Button>
            <Button type="submit" disabled={isPending} variant="primary">
              {submitButtonText}
            </Button>
          </div>
        </form>

        {additionalActions && <div className={styles.additionalActions}>{additionalActions}</div>}
      </div>
    </Modal>
  );
};

export default BaseAuthModal;
