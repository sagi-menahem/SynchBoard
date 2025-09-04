import defaultUserImage from 'assets/default-user-image.png';
import { useAuth } from 'features/auth/hooks';
import type { ToolbarConfig } from 'features/board/types/ToolbarTypes';
import { LogOut } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants';
import {
  ConfirmationDialog,
  PageLoader,
  PageTransition,
  PictureManager,
  SectionCard,
  UniversalToolbar,
} from 'shared/ui';
import logger from 'shared/utils/logger';
import { getNavigationArrowIcon } from 'shared/utils/rtlUtils';

import {
  BoardAppearanceSection,
  ChangePasswordForm,
  DangerZoneSection,
  LanguageSection,
  ProfileDetailsSection,
  ThemeSection,
} from '../components';
import { useAccountActions } from '../hooks';
import { useUserProfile } from '../hooks/profile';

import styles from './SettingsPage.module.scss';

/**
 * Comprehensive settings page component providing user account and preference management interface.
 * Integrates multiple settings sections including theme, language, board appearance, password management,
 * profile picture handling, personal details editing, and account deletion functionality.
 * Implements proper loading states, error handling, and confirmation dialogs for destructive actions.
 * Features responsive design with universal toolbar integration and proper navigation patterns.
 */
const SettingsPage: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [isPicDeleteConfirmOpen, setPicDeleteConfirmOpen] = useState(false);
  const [isAccountDeleteConfirmOpen, setAccountDeleteConfirmOpen] = useState(false);

  const { user, isLoading, handleUpdateProfile, handlePictureUpload, handlePictureDelete } =
    useUserProfile();

  const { handleChangePassword, handleDeleteAccount } = useAccountActions();

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
      // Always close dialog regardless of success or failure
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
          variant: 'warning',
        },
        {
          type: 'button',
          icon: getNavigationArrowIcon(),
          label: t('settings:page.boardListButton'),
          onClick: () => navigate(APP_ROUTES.BOARD_LIST),
          variant: 'navigation',
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
        <main className={styles.pageContent} data-has-toolbar>
          <div className={styles.loadError}>{t('settings:page.loadError')}</div>
        </main>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <UniversalToolbar config={toolbarConfig} />
      <main className={styles.pageContent} data-has-toolbar>
        <ThemeSection />

        <LanguageSection />

        <BoardAppearanceSection />

        <SectionCard title={t('settings:page.passwordSectionHeader')} variant="default">
          <ChangePasswordForm onSubmit={handleChangePassword} />
        </SectionCard>

        <SectionCard title={t('settings:page.changePicture')} variant="default">
          <PictureManager
            imageUrl={user.profilePictureUrl}
            defaultImage={defaultUserImage}
            altText={t('settings:page.profilePictureAlt', { userName: user.firstName })}
            onUpload={handlePictureUploadWithCleanup}
            onDelete={() => setPicDeleteConfirmOpen(true)}
            uploadButtonText={t('settings:page.changePicture')}
            deleteButtonText={t('settings:page.deletePicture')}
          />
        </SectionCard>

        <ProfileDetailsSection
          user={user}
          onUpdateProfile={async (data) => {
            await handleUpdateProfile(data);
          }}
        />

        <DangerZoneSection onDeleteAccount={() => setAccountDeleteConfirmOpen(true)} />

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
      </main>
    </PageTransition>
  );
};

export default SettingsPage;
