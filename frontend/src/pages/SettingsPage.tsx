import { APP_ROUTES } from 'constants';

import React, { useMemo } from 'react';

import { ArrowRight, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  ConfirmationDialog,
  LoadingOverlay,
  UniversalToolbar,
} from 'components/common';
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
import type { ToolbarConfig } from 'types/ToolbarTypes';

import styles from './SettingsPage.module.css';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  // Toolbar configuration
  const toolbarConfig: ToolbarConfig = useMemo(
    () => ({
      pageType: 'settings',
      leftSection: [
        {
          type: 'title',
          content: t('settingsPage.heading'),
        },
      ],
      rightSection: [
        {
          type: 'button',
          icon: LogOut,
          label: t('settingsPage.logoutButton'),
          onClick: logout,
          variant: 'destructive',
        },
        {
          type: 'button',
          icon: ArrowRight,
          label: t('settingsPage.backToBoards'),
          onClick: () => navigate(APP_ROUTES.BOARD_LIST),
        },
      ],
    }),
    [t, logout, navigate],
  );

  if (isLoading) {
    return (
      <>
        <UniversalToolbar config={toolbarConfig} />
        <LoadingOverlay message={t('settingsPage.loading')} />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <UniversalToolbar config={toolbarConfig} />
        <div className={styles.pageContent} data-has-toolbar>
          <div className={styles.loadError}>{t('settingsPage.loadError')}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <UniversalToolbar config={toolbarConfig} />
      <div className={styles.pageContent} data-has-toolbar>
        <section className={styles.section}>
          <ProfilePictureManager
            user={user}
            onUpload={handlePictureUpload}
            onDelete={() => setPicDeleteConfirmOpen(true)}
          />
        </section>

        <ProfileDetailsSection
          user={user}
          onUpdateProfile={handleUpdateProfile}
        />

        <LanguageSection />

        <section className={styles.section}>
          <h2 className={styles.sectionHeader}>
            {t('settingsPage.passwordSectionHeader')}
          </h2>
          <ChangePasswordForm onSubmit={handleChangePassword} />
        </section>

        <BoardAppearanceSection />

        <DangerZoneSection
          onDeleteAccount={() => setAccountDeleteConfirmOpen(true)}
        />

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
    </>
  );
};

export default SettingsPage;
