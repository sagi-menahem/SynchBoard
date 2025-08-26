import { APP_ROUTES } from 'constants';

import React from 'react';

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button, ConfirmationDialog } from 'components/common';
import {
  BoardAppearanceSection,
  ChangePasswordForm,
  DangerZoneSection,
  LanguageSection,
  ProfileDetailsSection,
  ProfilePictureManager,
} from 'components/settings';
import { useAuth } from 'hooks/auth';
import { useSettingsPage } from 'hooks/settings';

import styles from './SettingsPage.module.css';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
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
        <div className={styles.headerActions}>
          <Button onClick={logout} variant="secondary">
            {t('settingsPage.logoutButton')}
          </Button>
          <Link to={APP_ROUTES.BOARD_LIST}>
            <Button variant="secondary">&larr; {t('settingsPage.backToBoards')}</Button>
          </Link>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionHeader}>{t('settingsPage.pictureSectionHeader')}</h2>
        <ProfilePictureManager
          user={user}
          onUpload={handlePictureUpload}
          onDelete={() => setPicDeleteConfirmOpen(true)}
        />
      </section>

      <ProfileDetailsSection user={user} onUpdateProfile={handleUpdateProfile} />

      <LanguageSection />

      <section className={styles.section}>
        <h2 className={styles.sectionHeader}>{t('settingsPage.passwordSectionHeader')}</h2>
        <ChangePasswordForm onSubmit={handleChangePassword} />
      </section>

      <BoardAppearanceSection />

      <DangerZoneSection onDeleteAccount={() => setAccountDeleteConfirmOpen(true)} />

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
