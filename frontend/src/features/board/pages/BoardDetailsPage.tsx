import { LogOut, UserPlus } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useIsMobile } from 'shared/hooks';
import { AppHeader, Button, PageLoader, PageTransition, SectionCard } from 'shared/ui';
import utilStyles from 'shared/ui/styles/utils.module.scss';
import { getBackArrowIcon } from 'shared/utils/rtlUtils';

import {
    BoardConfirmDialogs,
    BoardDetailsHeader,
    BoardEditModals,
    CanvasSettingsSection,
    MemberContextMenu,
    MemberList,
} from '../components/details';
import { useBoardDetailsPage } from '../hooks/details';

import styles from './BoardDetailsPage.module.scss';

/**
 * Board Details Page component that provides comprehensive board management functionality.
 * This page serves as the central hub for board administration, allowing users to view and
 * modify board settings, manage member permissions, configure canvas properties, and handle
 * board-level operations. It integrates toolbar navigation, modal dialogs for various operations,
 * and context menus for member management while providing different permission levels based
 * on user roles.
 */
const BoardDetailsPage: React.FC = () => {
  const { t } = useTranslation(['board', 'common']);
  const navigate = useNavigate();
  const { boardId } = useParams<{ boardId: string }>();
  const numericBoardId = parseInt(boardId ?? '0', 10);
  const isMobile = useIsMobile();

  // Extract board management state and handlers from the dedicated hook
  const {
    isLoading,
    boardDetails,
    currentUserIsAdmin,
    contextMenu,
    inviteForm,
    isInviteModalOpen,
    setInviteModalOpen,
    editingField,
    setEditingField,
    isLeaveConfirmOpen,
    setLeaveConfirmOpen,
    isDeleteConfirmOpen,
    setDeleteConfirmOpen,
    handleInviteSuccess,
    handlePromote,
    handleRemove,
    handleUpdateName,
    handleUpdateDescription,
    handleRightClick,
    handleLeaveBoard,
    handlePictureUpload,
    promptPictureDelete,
    handleConfirmDeletePicture,
    handleCanvasSettingsUpdate,
  } = useBoardDetailsPage(numericBoardId);

  const [isQuickSettingsOpen, setQuickSettingsOpen] = React.useState(false);

  // CSS variables for background styling
  const containerStyle = useMemo(
    () =>
      ({
        '--background-blur': '0px',
        '--background-size': isMobile ? '280px 280px' : '400px 400px',
      }) as React.CSSProperties,
    [isMobile],
  );

  // Icon components for AppHeader
  const BackArrowIcon = getBackArrowIcon();

  // Navigation handlers
  const handleGoToBoard = () => navigate(`/board/${numericBoardId}`);

  if (isLoading) {
    return (
      <PageTransition className={utilStyles.unifiedDotBackground} style={containerStyle}>
        <AppHeader
          leading={
            <Button variant="icon" onClick={handleGoToBoard} title={t('common:back')}>
              <BackArrowIcon size={20} />
            </Button>
          }
          title={<span>{t('common:loading')}</span>}
        />
        <PageLoader message={t('board:detailsPage.loading')} />
      </PageTransition>
    );
  }

  if (!boardDetails) {
    return (
      <PageTransition className={utilStyles.unifiedDotBackground} style={containerStyle}>
        <AppHeader
          leading={
            <Button variant="icon" onClick={handleGoToBoard} title={t('common:back')}>
              <BackArrowIcon size={20} />
            </Button>
          }
          title={<span>{t('board:detailsPage.notFound')}</span>}
        />
        <main className={styles.pageContent}>
          <div className={styles.notFound}>{t('board:detailsPage.notFound')}</div>
        </main>
      </PageTransition>
    );
  }

  return (
    <PageTransition className={utilStyles.unifiedDotBackground} style={containerStyle}>
      <AppHeader
        leading={
          <Button variant="icon" onClick={handleGoToBoard} title={t('common:back')}>
            <BackArrowIcon size={20} />
          </Button>
        }
        title={<span>{boardDetails.name}</span>}
        trailing={
          <>
            <Button
              variant="icon"
              onClick={() => setLeaveConfirmOpen(true)}
              title={t('board:leaveBoard.button')}
            >
              <LogOut size={20} />
              <span className={styles.buttonLabel}>{t('board:leaveBoard.button')}</span>
            </Button>
            {currentUserIsAdmin && (
              <Button
                variant="icon"
                onClick={() => setInviteModalOpen(true)}
                title={t('board:detailsPage.inviteButton')}
              >
                <UserPlus size={20} />
                <span className={styles.buttonLabel}>{t('board:detailsPage.inviteButton')}</span>
              </Button>
            )}
          </>
        }
      />
      <main className={styles.pageContent}>
        {/* Left Column - Board Visual & Description */}
        <div className={styles.leftColumn}>
          <BoardDetailsHeader
            boardDetails={boardDetails}
            currentUserIsAdmin={currentUserIsAdmin}
            onPictureUpload={handlePictureUpload}
            onUpdateDescription={handleUpdateDescription}
            onDeletePicture={promptPictureDelete}
            onEditName={() => setEditingField('name')}
          />
        </div>

        {/* Right Column - Settings & Members */}
        <div className={styles.rightColumn}>
          <CanvasSettingsSection
            boardDetails={boardDetails}
            isAdmin={currentUserIsAdmin}
            onUpdateSettings={handleCanvasSettingsUpdate}
          />

          <SectionCard title={t('board:detailsPage.membersHeader')} variant="default">
            <ul className={styles.membersListContainer}>
              <MemberList members={boardDetails.members} onMemberContextMenu={handleRightClick} />
            </ul>
          </SectionCard>
        </div>
      </main>

      <MemberContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.anchorPoint.x}
        y={contextMenu.anchorPoint.y}
        member={contextMenu.data}
        onClose={contextMenu.closeMenu}
        onPromote={handlePromote}
        onRemove={handleRemove}
      />

      <BoardEditModals
        isInviteModalOpen={isInviteModalOpen}
        editingField={editingField}
        boardName={boardDetails.name}
        inviteForm={inviteForm}
        onCloseInvite={() => setInviteModalOpen(false)}
        onCloseEdit={() => setEditingField(null)}
        onInviteSuccess={handleInviteSuccess}
        onUpdateName={handleUpdateName}
      />

      <BoardConfirmDialogs
        isLeaveConfirmOpen={isLeaveConfirmOpen}
        isDeleteConfirmOpen={isDeleteConfirmOpen}
        boardName={boardDetails.name}
        onCloseLeave={() => setLeaveConfirmOpen(false)}
        onCloseDelete={() => setDeleteConfirmOpen(false)}
        onConfirmLeave={handleLeaveBoard}
        onConfirmDelete={handleConfirmDeletePicture}
      />

      {isQuickSettingsOpen && (
        <div className={styles.quickSettingsModal}>
          <div className={styles.quickSettingsContent}>
            <CanvasSettingsSection
              boardDetails={boardDetails}
              isAdmin={currentUserIsAdmin}
              onUpdateSettings={async (settings) => {
                await handleCanvasSettingsUpdate(settings);
                setQuickSettingsOpen(false);
              }}
            />
            <Button
              variant="icon"
              className={styles.closeQuickSettings}
              onClick={() => setQuickSettingsOpen(false)}
            >
              ×
            </Button>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

export default BoardDetailsPage;
