import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import logger from 'utils/Logger';

import { Button, Input } from 'components/common';
import styles from 'components/common/CommonForm.module.css';


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
    const { t } = useTranslation();
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
        <form onSubmit={handleFieldEditSubmit} className={styles.form}>
            <h3>{title}</h3>

            <div className={styles.field}>
                <label htmlFor="edit-field">{label}</label>
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
                    {t('common.button.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting} variant="primary">
                    {isSubmitting ? t('common.button.creating') : t('common.button.save')}
                </Button>
            </div>
        </form>
    );
};

export default EditFieldForm;
