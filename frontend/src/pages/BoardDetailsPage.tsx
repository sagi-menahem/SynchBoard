import React, { useMemo } from 'react';

import { ArrowRight, Edit, LogOut, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import {
  BoardConfirmDialogs,
  BoardDetailsHeader,
  BoardEditModals,
  CanvasSettingsSection,
  MemberContextMenu,
  MemberList,
} from 'components/board/details';
import { LoadingOverlay, UniversalToolbar } from 'components/common';
import { useBoardDetailsPage } from 'hooks/board/details';
import type { ToolbarConfig } from 'types/ToolbarTypes';

import styles from './BoardDetailsPage.module.css';

const BoardDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
  // const onlineMemberCount = boardDetails?.members?.length || 0; // TODO: implement real online status
  // const totalMemberCount = boardDetails?.members?.length || 0;

  // Toolbar configuration
  const toolbarConfig: ToolbarConfig = useMemo(() => ({
    pageType: 'board-details',
    leftSection: [
      {
        type: 'title',
        content: boardDetails?.name || t('common.loading'),
      },
      ...(boardDetails && currentUserIsAdmin ? [{
        type: 'button' as const,
        icon: Edit,
        label: t('toolbar.editBoard.tooltip'),
        onClick: () => setEditingField('name'),
        variant: 'icon' as const,
      }] : []),
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
        type: 'button',
        icon: LogOut,
        label: t('leaveBoard.button'),
        onClick: () => setLeaveConfirmOpen(true),
        variant: 'destructive',
      },
      {
        type: 'button',
        icon: ArrowRight,
        label: '',
        onClick: () => navigate(`/board/${numericBoardId}`),
        className: 'iconOnlyButton',
      },
    ],
  }), [
    boardDetails,
    currentUserIsAdmin,
    t,
    numericBoardId,
    navigate,
    setInviteModalOpen,
    setLeaveConfirmOpen,
    setEditingField,
  ]);


  if (isLoading) {
    return (
      <>
        <UniversalToolbar config={toolbarConfig} />
        <LoadingOverlay message={t('boardDetailsPage.loading')} />
      </>
    );
  }

  if (!boardDetails) {
    return (
      <>
        <UniversalToolbar config={toolbarConfig} />
        <div className={styles.pageContent} data-has-toolbar>
          <div className={styles.notFound}>{t('boardDetailsPage.notFound')}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <UniversalToolbar config={toolbarConfig} />
      <div className={styles.pageContent} data-has-toolbar>
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
