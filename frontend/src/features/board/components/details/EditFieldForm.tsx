import React, { useState } from 'react';

import { Edit, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'shared/ui';
import styles from 'shared/ui/styles/CommonForm.module.scss';
import logger from 'shared/utils/logger';


interface EditFieldFormProps {
    title: string;
    label: string;
    initialValue: string;
    inputType?: 'input' | 'textarea';
    onSave: (value: string) => Promise<void>;
    onClose: () => void;
}

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
            <textarea
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
