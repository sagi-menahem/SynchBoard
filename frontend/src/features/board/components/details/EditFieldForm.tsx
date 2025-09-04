import { Edit, FileText } from 'lucide-react';
import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Button, Input, Textarea } from 'shared/ui';
import styles from 'shared/ui/styles/CommonForm.module.scss';
import logger from 'shared/utils/logger';

/**
 * Props interface for EditFieldForm component.
 * Defines the form configuration and event handlers for field editing operations.
 */
interface EditFieldFormProps {
  /** Title displayed in the modal header */
  title: string;
  /** Label text for the input field */
  label: string;
  /** Current value to populate the input field */
  initialValue: string;
  /** Type of input control to render - single line or multi-line text */
  inputType?: 'input' | 'textarea';
  /** Handler for saving the updated field value with async validation */
  onSave: (value: string) => Promise<void>;
  /** Handler to close the edit form modal */
  onClose: () => void;
}

/**
 * Generic form component for editing single field values in modal dialogs.
 * This reusable component provides a consistent interface for editing various 
 * board fields with support for both single-line inputs and multi-line textareas.
 * 
 * @param title - Title displayed in the modal header
 * @param label - Label text for the input field
 * @param initialValue - Current value to populate the input field
 * @param inputType - Type of input control to render - single line or multi-line text
 * @param onSave - Handler for saving the updated field value with async validation
 * @param onClose - Handler to close the edit form modal
 */
const EditFieldForm: React.FC<EditFieldFormProps> = ({
  title,
  label,
  initialValue,
  inputType = 'input',
  onSave,
  onClose,
}) => {
  const { t } = useTranslation(['board', 'common']);
  const [value, setValue] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(value);
      onClose();
    } catch (error) {
      logger.error('Failed to save field:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>
          <Edit size={20} />
          {title}
        </h3>
      </div>

      <form onSubmit={handleFieldEditSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="edit-field">
            <FileText size={14} />
            {label}
          </label>
          {inputType === 'textarea' ? (
            <Textarea
              id="edit-field"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={4}
              className={styles.description}
              disabled={isSubmitting}
            />
          ) : (
            <Input
              id="edit-field"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={isSubmitting}
              required
            />
          )}
        </div>

        <div className={styles.buttonGroup}>
          <Button type="button" onClick={onClose} disabled={isSubmitting} variant="secondary">
            {t('common:button.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting} variant="primary">
            {isSubmitting ? t('common:button.saving') : t('common:button.save')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditFieldForm;
