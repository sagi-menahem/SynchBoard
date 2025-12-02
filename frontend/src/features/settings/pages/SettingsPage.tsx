import defaultUserImage from 'assets/default-user-image.png';
import { useAuth } from 'features/auth/hooks';
import { ArrowLeft, LogOut } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants';
import { useIsMobile } from 'shared/hooks';
import {
  AppHeader,
  Button,
  ConfirmationDialog,
  PageLoader,
  PageTransition,
  PictureManager,
  SectionCard,
} from 'shared/ui';
import utilStyles from 'shared/ui/styles/utils.module.scss';
import logger from 'shared/utils/logger';

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
 * Features responsive design with AppHeader integration and proper navigation patterns.
 */
const SettingsPage: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isMobile = useIsMobile();

  const [isPicDeleteConfirmOpen, setPicDeleteConfirmOpen] = useState(false);
  const [isAccountDeleteConfirmOpen, setAccountDeleteConfirmOpen] = useState(false);

  const { user, isLoading, handleUpdateProfile, handlePictureUpload, handlePictureDelete } =
    useUserProfile();

  const { handleChangePassword, handleDeleteAccount } = useAccountActions();

  const containerStyle = useMemo(
    () =>
      ({
        '--background-blur': '0px',
        '--background-size': isMobile ? '280px 280px' : '400px 400px',
      }) as React.CSSProperties,
    [isMobile],
  );

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

  if (isLoading) {
    return (
      <PageTransition className={utilStyles.unifiedDotBackground} style={containerStyle}>
        <AppHeader
          leading={
            <Button
              variant="icon"
              onClick={() => navigate(APP_ROUTES.BOARD_LIST)}
              title={t('settings:page.boardListButton')}
            >
              <ArrowLeft size={20} />
            </Button>
          }
          title={<span className={styles.pageTitle}>{t('settings:page.heading')}</span>}
          trailing={
            <Button variant="icon" onClick={logout} title={t('settings:page.logoutButton')}>
              <LogOut size={20} />
              <span className={styles.logoutLabel}>{t('settings:page.logoutButton')}</span>
            </Button>
          }
        />
        <PageLoader message={t('settings:page.loading')} />
      </PageTransition>
    );
  }

  if (!user) {
    return (
      <PageTransition className={utilStyles.unifiedDotBackground} style={containerStyle}>
        <AppHeader
          leading={
            <Button
              variant="icon"
              onClick={() => navigate(APP_ROUTES.BOARD_LIST)}
              title={t('settings:page.boardListButton')}
            >
              <ArrowLeft size={20} />
            </Button>
          }
          title={<span className={styles.pageTitle}>{t('settings:page.heading')}</span>}
          trailing={
            <Button variant="icon" onClick={logout} title={t('settings:page.logoutButton')}>
              <LogOut size={20} />
              <span className={styles.logoutLabel}>{t('settings:page.logoutButton')}</span>
            </Button>
          }
        />
        <main className={styles.pageContent}>
          <div className={styles.loadError}>{t('settings:page.loadError')}</div>
        </main>
      </PageTransition>
    );
  }

  return (
    <PageTransition className={utilStyles.unifiedDotBackground} style={containerStyle}>
      <AppHeader
        leading={
          <Button
            variant="icon"
            onClick={() => navigate(APP_ROUTES.BOARD_LIST)}
            title={t('settings:page.boardListButton')}
          >
            <ArrowLeft size={20} />
          </Button>
        }
        title={<span className={styles.pageTitle}>{t('settings:page.heading')}</span>}
        trailing={
          <Button variant="icon" onClick={logout} title={t('settings:page.logoutButton')}>
            <LogOut size={20} />
            <span className={styles.logoutLabel}>{t('settings:page.logoutButton')}</span>
          </Button>
        }
      />
      <main className={styles.pageContent}>
        {/* Left Column - Appearance & Preferences */}
        <div className={styles.leftColumn}>
          <ThemeSection />
          <LanguageSection />
          <BoardAppearanceSection />
          <ProfileDetailsSection
            user={user}
            onUpdateProfile={async (data) => {
              await handleUpdateProfile(data);
            }}
          />
        </div>

        {/* Right Column - Security & Account Management */}
        <div className={styles.rightColumn}>
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

          <div className={styles.dangerZone}>
            <DangerZoneSection onDeleteAccount={() => setAccountDeleteConfirmOpen(true)} />
          </div>
        </div>
      </main>

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
    </PageTransition>
  );
};

export default SettingsPage;
