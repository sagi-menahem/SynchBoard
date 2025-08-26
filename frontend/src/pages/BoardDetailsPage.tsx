import React, { useMemo } from 'react';

import { ArrowLeft, LogOut, Settings, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import {
  BoardConfirmDialogs,
  BoardDetailsHeader,
  BoardEditModals,
  CanvasSettingsSection,
  MemberContextMenu,
  MemberList,
  PictureManagerModal,
} from 'components/board/details';
import { UniversalToolbar } from 'components/common';
import { useBoardDetailsPage } from 'hooks/board/details';
import type { ToolbarConfig } from 'types/ToolbarTypes';

import styles from './BoardDetailsPage.module.css';

const BoardDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const { boardId } = useParams<{ boardId: string }>();
  const numericBoardId = parseInt(boardId || '0', 10);

  const {
    isLoading,
    boardDetails,
    currentUserIsAdmin,
    contextMenu,
    isInviteModalOpen,
    setInviteModalOpen,
    editingField,
    setEditingField,
    isLeaveConfirmOpen,
    setLeaveConfirmOpen,
    isPictureModalOpen,
    setPictureModalOpen,
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

  // State for quick canvas settings modal
  const [isQuickSettingsOpen, setQuickSettingsOpen] = React.useState(false);

  // Calculate online members (mock data - you may have real data from WebSocket)
  const onlineMemberCount = boardDetails?.members?.length || 0; // TODO: implement real online status
  const totalMemberCount = boardDetails?.members?.length || 0;

  // Toolbar configuration
  const toolbarConfig: ToolbarConfig = useMemo(() => ({
    pageType: 'board-details',
    leftSection: [
      {
        type: 'title',
        content: boardDetails?.name || 'Loading...',
      },
      ...(currentUserIsAdmin ? [{
        type: 'button' as const,
        icon: UserPlus,
        label: t('boardDetailsPage.inviteButton'),
        onClick: () => setInviteModalOpen(true),
        primary: true,
      }] : []),
    ],
    rightSection: [
      {
        type: 'memberActivity',
        memberCount: totalMemberCount,
        onlineCount: onlineMemberCount,
        onClick: () => {
          // Scroll to members section
          const membersSection = document.querySelector('[data-section="members"]');
          membersSection?.scrollIntoView({ behavior: 'smooth' });
        },
      },
      {
        type: 'button',
        icon: Settings,
        label: t('boardDetails.canvasSettings.edit'),
        onClick: () => setQuickSettingsOpen(true),
      },
      {
        type: 'button',
        icon: LogOut,
        label: t('leaveBoard.button'),
        onClick: () => setLeaveConfirmOpen(true),
        variant: 'destructive',
      },
      {
        type: 'button',
        icon: ArrowLeft,
        label: t('boardDetailsPage.backToBoardButton'),
        onClick: () => window.location.href = `/board/${numericBoardId}`,
      },
    ],
  }), [
    boardDetails?.name,
    currentUserIsAdmin,
    t,
    setInviteModalOpen,
    totalMemberCount,
    onlineMemberCount,
    setLeaveConfirmOpen,
    numericBoardId,
  ]);


  if (isLoading) {
    return (
      <>
        <UniversalToolbar config={toolbarConfig} />
        <div className={styles.pageContent}>
          <div className={styles.loading}>{t('boardDetailsPage.loading')}</div>
        </div>
      </>
    );
  }

  if (!boardDetails) {
    return (
      <>
        <UniversalToolbar config={toolbarConfig} />
        <div className={styles.pageContent}>
          <div className={styles.notFound}>{t('boardDetailsPage.notFound')}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <UniversalToolbar config={toolbarConfig} />
      <div className={styles.pageContent}>
        <BoardDetailsHeader
          boardDetails={boardDetails}
          currentUserIsAdmin={currentUserIsAdmin}
          numericBoardId={numericBoardId}
          onSetPictureModalOpen={setPictureModalOpen}
          onSetEditingField={setEditingField}
          onSetLeaveConfirmOpen={setLeaveConfirmOpen}
          onSetInviteModalOpen={setInviteModalOpen}
        />

        <CanvasSettingsSection
          boardDetails={boardDetails}
          isAdmin={currentUserIsAdmin}
          onUpdateSettings={handleCanvasSettingsUpdate}
        />

        <div className={styles.membersSection} data-section="members">
          <h2 className={styles.sectionTitle}>{t('boardDetailsPage.membersHeader')}</h2>
          <ul className={styles.membersListContainer}>
            <MemberList members={boardDetails.members} onMemberContextMenu={handleRightClick} />
          </ul>
        </div>
      </div>

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
        boardId={numericBoardId}
        boardName={boardDetails.name}
        boardDescription={boardDetails.description || ''}
        onCloseInvite={() => setInviteModalOpen(false)}
        onCloseEdit={() => setEditingField(null)}
        onInviteSuccess={handleInviteSuccess}
        onUpdateName={handleUpdateName}
        onUpdateDescription={handleUpdateDescription}
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

      <PictureManagerModal
        isOpen={isPictureModalOpen}
        onClose={() => setPictureModalOpen(false)}
        boardName={boardDetails.name}
        pictureUrl={boardDetails.pictureUrl}
        onPictureUpload={handlePictureUpload}
        onPictureDelete={promptPictureDelete}
      />

      {/* Quick Canvas Settings Modal */}
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
            <button 
              className={styles.closeQuickSettings}
              onClick={() => setQuickSettingsOpen(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BoardDetailsPage;
