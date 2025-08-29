import React, { useMemo, useState } from 'react';

import defaultUserImage from 'assets/default-user-image.png';
import { useAuth } from 'features/auth/hooks';
import type { ToolbarConfig } from 'features/board/types/ToolbarTypes';
import { ArrowRight, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants';
import {
  ConfirmationDialog,
  PageLoader,
  PageTransition,
  PictureManager,
  UniversalToolbar,
} from 'shared/ui';
import logger from 'shared/utils/logger';

import {
  BoardAppearanceSection,
  ChangePasswordForm,
  DangerZoneSection,
  LanguageSection,
  ProfileDetailsSection,
  ThemeSection,
} from '../components';
import { useAccountManager, usePasswordManager } from '../hooks';
import { useUserProfile } from '../hooks/profile';


import styles from './SettingsPage.module.scss';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Local modal states
  const [isPicDeleteConfirmOpen, setPicDeleteConfirmOpen] = useState(false);
  const [isAccountDeleteConfirmOpen, setAccountDeleteConfirmOpen] = useState(false);

  // Consolidated profile hook - no more coordination needed
  const { 
    user, 
    isLoading, 
    handleUpdateProfile, 
    handlePictureUpload, 
    handlePictureDelete,
  } = useUserProfile();
  
  const { handleChangePassword } = usePasswordManager();
  const { handleDeleteAccount } = useAccountManager();

  // Simplified handler functions with cleanup
  const handlePictureUploadWithCleanup = async (file: File) => {
    try {
      await handlePictureUpload(file);
    } catch (error) {
      logger.error('Picture upload failed:', error);
      throw error;
    }
  };

  const handlePictureDeleteWithCleanup = async () => {
    try {
      await handlePictureDelete();
    } finally {
      setPicDeleteConfirmOpen(false);
    }
  };

  const handleDeleteAccountWithCleanup = async () => {
    try {
      await handleDeleteAccount();
    } finally {
      setAccountDeleteConfirmOpen(false);
    }
  };

  const toolbarConfig: ToolbarConfig = useMemo(
    () => ({
      pageType: 'settings',
      leftSection: [
        {
          type: 'title',
          content: t('settings:page.heading'),
        },
      ],
      rightSection: [
        {
          type: 'button',
          icon: LogOut,
          label: t('settings:page.logoutButton'),
          onClick: logout,
          variant: 'destructive',
        },
        {
          type: 'button',
          icon: ArrowRight,
          label: '',
          onClick: () => navigate(APP_ROUTES.BOARD_LIST),
          className: 'iconOnlyButton',
        },
      ],
    }),
    [t, logout, navigate],
  );

  if (isLoading) {
    return (
      <PageTransition>
        <UniversalToolbar config={toolbarConfig} />
        <PageLoader message={t('settings:page.loading')} />
      </PageTransition>
    );
  }

  if (!user) {
    return (
      <PageTransition>
        <UniversalToolbar config={toolbarConfig} />
        <div className={styles.pageContent} data-has-toolbar>
          <div className={styles.loadError}>{t('settings:page.loadError')}</div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <UniversalToolbar config={toolbarConfig} />
      <div className={styles.pageContent} data-has-toolbar>
        <section className={styles.section}>
          <PictureManager
            imageUrl={user.profilePictureUrl}
            defaultImage={defaultUserImage}
            altText={t('settings:page.profilePictureAlt', { userName: user.firstName })}
            onUpload={handlePictureUploadWithCleanup}
            onDelete={() => setPicDeleteConfirmOpen(true)}
            uploadButtonText={t('settings:page.changePicture')}
            deleteButtonText={t('settings:page.deletePicture')}
          />
        </section>

        <ProfileDetailsSection
          user={user}
          onUpdateProfile={handleUpdateProfile}
        />

        <LanguageSection />

        <ThemeSection />

        <section className={styles.section}>
          <h2 className={styles.sectionHeader}>
            {t('settings:page.passwordSectionHeader')}
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
          onConfirm={handlePictureDeleteWithCleanup}
          title={t('settings:page.deletePictureConfirmTitle')}
          message={t('settings:page.deletePictureConfirmText')}
        />

        <ConfirmationDialog
          isOpen={isAccountDeleteConfirmOpen}
          onClose={() => setAccountDeleteConfirmOpen(false)}
          onConfirm={handleDeleteAccountWithCleanup}
          title={t('settings:page.deleteAccountConfirmTitle')}
          message={t('settings:page.deleteAccountConfirmText')}
        />
      </div>
    </PageTransition>
  );
};

export default SettingsPage;
