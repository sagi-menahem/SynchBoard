// File: frontend/src/components/settings/ChangePasswordForm.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import type { ChangePasswordRequest } from '../../types/user.types';
import styles from './ChangePasswordForm.module.css';
import Input from '../common/Input';
import Button from '../common/Button';

interface ChangePasswordFormProps {
    onSubmit: (data: ChangePasswordRequest) => Promise<void>;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onSubmit }) => {
    const { t } = useTranslation();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (newPassword.length < 8) {
            toast.error(t('settingsPage.passwordTooShort'));
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error(t('settingsPage.passwordsDoNotMatch'));
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({ currentPassword, newPassword });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch {
            // Error toast is handled in the hook, no need to show another one here.
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className={styles.field}>
                <label htmlFor="currentPassword">{t('settingsPage.currentPasswordLabel')}</label>
                <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                />
            </div>
            <div className={styles.field}>
                <label htmlFor="newPassword">{t('settingsPage.newPasswordLabel')}</label>
                <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
            </div>
            <div className={styles.field}>
                <label htmlFor="confirmPassword">{t('settingsPage.confirmPasswordLabel')}</label>
                <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('common.button.saving') : t('settingsPage.buttons.save')}
            </Button>
        </form>
    );
};

export default ChangePasswordForm;