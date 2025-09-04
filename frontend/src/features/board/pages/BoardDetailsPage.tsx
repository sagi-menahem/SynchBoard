import type { ToolbarConfig } from 'features/board/types/ToolbarTypes';
import { LogOut, UserPlus } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, PageLoader, PageTransition, SectionCard, UniversalToolbar } from 'shared/ui';
import { getNavigationArrowIcon } from 'shared/utils/rtlUtils';

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

const BoardDetailsPage: React.FC = () => {
  const { t } = useTranslation(['board', 'common']);
  const navigate = useNavigate();
  const { boardId } = useParams<{ boardId: string }>();
  const numericBoardId = parseInt(boardId ?? '0', 10);

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

  const toolbarConfig: ToolbarConfig = useMemo(
    () => ({
      pageType: 'board-details',
      leftSection: [
        {
          type: 'title',
          content: boardDetails?.name ?? t('common:loading'),
          ...(boardDetails && currentUserIsAdmin
            ? {
                clickable: true,
                onClick: () => setEditingField('name'),
              }
            : {}),
        },
        ...(currentUserIsAdmin
          ? [
              {
                type: 'button' as const,
                icon: UserPlus,
                label: t('board:detailsPage.inviteButton'),
                onClick: () => setInviteModalOpen(true),
                variant: 'cta' as const,
              },
            ]
          : []),
      ],
      rightSection: [
        {
          type: 'button',
          icon: LogOut,
          label: t('board:leaveBoard.button'),
          onClick: () => setLeaveConfirmOpen(true),
          variant: 'warning' as const,
        },
        {
          type: 'button',
          icon: getNavigationArrowIcon(),
          label: t('board:detailsPage.boardButton'),
          onClick: () => navigate(`/board/${numericBoardId}`),
          variant: 'navigation' as const,
          className: 'iconOnlyButton',
        },
      ],
    }),
    [
      boardDetails,
      currentUserIsAdmin,
      t,
      numericBoardId,
      navigate,
      setInviteModalOpen,
      setLeaveConfirmOpen,
      setEditingField,
    ],
  );

  if (isLoading) {
    return (
      <PageTransition>
        <UniversalToolbar config={toolbarConfig} />
        <PageLoader message={t('board:detailsPage.loading')} />
      </PageTransition>
    );
  }

  if (!boardDetails) {
    return (
      <PageTransition>
        <UniversalToolbar config={toolbarConfig} />
        <main className={styles.pageContent} data-has-toolbar>
          <div className={styles.notFound}>{t('board:detailsPage.notFound')}</div>
        </main>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <UniversalToolbar config={toolbarConfig} />
      <main className={styles.pageContent} data-has-toolbar>
        <BoardDetailsHeader
          boardDetails={boardDetails}
          currentUserIsAdmin={currentUserIsAdmin}
          onPictureUpload={handlePictureUpload}
          onUpdateDescription={handleUpdateDescription}
          onDeletePicture={promptPictureDelete}
        />

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
