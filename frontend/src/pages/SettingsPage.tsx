// File: frontend/src/pages/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSettingsPage } from '../hooks/useSettingsPage';
import { APP_ROUTES } from '../constants/routes.constants';
import type { UpdateUserProfileRequest } from '../types/user.types';
import styles from './SettingsPage.module.css';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ChangePasswordForm from '../components/settings/ChangePasswordForm';
import ProfilePictureManager from '../components/settings/ProfilePictureManager';
import ConfirmationDialog from '../components/common/ConfirmationDialog';

const SettingsPage: React.FC = () => {
    const { t } = useTranslation();
    const {
        user,
        isLoading,
        isPicDeleteConfirmOpen,
        setPicDeleteConfirmOpen,
        isAccountDeleteConfirmOpen,
        setAccountDeleteConfirmOpen,
        handleUpdateProfile,
        handleChangePassword,
        handlePictureUpload,
        handlePictureDelete,
        handleDeleteAccount,
    } = useSettingsPage();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UpdateUserProfileRequest>({
        firstName: '',
        lastName: '',
        phoneNumber: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
            });
        }
    }, [user]);


    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSave = async () => {
        if (!user) return;
        try {
            await handleUpdateProfile(formData);
            setIsEditing(false);
        } catch {
            // Error toast is handled in the hook, no need to show another one here.
        }
    };

    const onCancel = () => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
            });
        }
        setIsEditing(false);
    };

    if (isLoading) {
        return <div>{t('settingsPage.loading')}</div>;
    }

    if (!user) {
        return <div>{t('settingsPage.loadError')}</div>;
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h1>{t('settingsPage.heading')}</h1>
                <Link to={APP_ROUTES.BOARD_LIST}>
                    <Button variant="secondary">
                        &larr; {t('settingsPage.backToBoards')}
                    </Button>
                </Link>
            </div>

            <section className={styles.section}>
                <h2 className={styles.sectionHeader}>
                    {t('settingsPage.pictureSectionHeader')}
                </h2>
                <ProfilePictureManager
                    user={user}
                    onUpload={handlePictureUpload}
                    onDelete={() => setPicDeleteConfirmOpen(true)}
                />
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionHeader}>
                    {t('settingsPage.profileSectionHeader')}
                    {!isEditing && (
                        <Button onClick={() => setIsEditing(true)} variant="secondary">
                            {t('settingsPage.buttons.edit')}
                        </Button>
                    )}
                </h2>

                {!isEditing ? (
                    <>
                        <div className={styles.field}>
                            <label>{t('settingsPage.firstNameLabel')}</label>
                            <p>{user.firstName}</p>
                        </div>
                        <div className={styles.field}>
                            <label>{t('settingsPage.lastNameLabel')}</label>
                            <p>{user.lastName}</p>
                        </div>
                        <div className={styles.field}>
                            <label>{t('settingsPage.phoneNumberLabel')}</label>
                            <p>{user.phoneNumber}</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.field}>
                            <label htmlFor="firstName">{t('settingsPage.firstNameLabel')}</label>
                            <Input id="firstName" name="firstName" value={formData.firstName} onChange={onInputChange} />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="lastName">{t('settingsPage.lastNameLabel')}</label>
                            <Input id="lastName" name="lastName" value={formData.lastName} onChange={onInputChange} />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="phoneNumber">{t('settingsPage.phoneNumberLabel')}</label>
                            <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={onInputChange} />
                        </div>
                        <div className={styles.buttonGroup}>
                            <Button onClick={onCancel} variant="secondary">{t('settingsPage.buttons.cancel')}</Button>
                            <Button onClick={onSave} variant="primary">{t('settingsPage.buttons.save')}</Button>
                        </div>
                    </>
                )}
            </section>
            <section className={styles.section}>
                <h2 className={styles.sectionHeader}>
                    {t('settingsPage.passwordSectionHeader')}
                </h2>
                <ChangePasswordForm onSubmit={handleChangePassword} />
            </section>
            <section className={`${styles.section} ${styles.dangerZone}`}>
                <h2 className={styles.sectionHeader}>
                    {t('settingsPage.dangerZoneHeader')}
                </h2>
                <p>This action is permanent and cannot be undone.</p>
                <Button
                    onClick={() => setAccountDeleteConfirmOpen(true)}
                    className={styles.destructiveButton}
                >
                    {t('settingsPage.deleteAccountButton')}
                </Button>
            </section>

            <ConfirmationDialog
                isOpen={isPicDeleteConfirmOpen}
                onClose={() => setPicDeleteConfirmOpen(false)}
                onConfirm={handlePictureDelete}
                title={t('settingsPage.deletePictureConfirmTitle')}
                message={t('settingsPage.deletePictureConfirmText')}
            />

            <ConfirmationDialog
                isOpen={isAccountDeleteConfirmOpen}
                onClose={() => setAccountDeleteConfirmOpen(false)}
                onConfirm={handleDeleteAccount}
                title={t('settingsPage.deleteAccountConfirmTitle')}
                message={t('settingsPage.deleteAccountConfirmText')}
            />
        </div>
    );
};

export default SettingsPage;