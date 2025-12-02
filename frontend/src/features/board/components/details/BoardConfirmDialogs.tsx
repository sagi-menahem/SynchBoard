import React from 'react';

import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from 'shared/ui';

/**
 * Props interface for BoardConfirmDialogs component.
 * Defines the state and event handlers required for managing board-related confirmation dialogs.
 */
interface BoardConfirmDialogsProps {
  /** Controls visibility of the leave board confirmation dialog */
  isLeaveConfirmOpen: boolean;
  /** Controls visibility of the delete board confirmation dialog */
  isDeleteConfirmOpen: boolean;
  /** Controls visibility of the remove member confirmation dialog */
  isRemoveMemberConfirmOpen: boolean;
  /** Name of the board being acted upon, used in confirmation messages */
  boardName: string;
  /** Name of the member to remove, used in confirmation messages */
  memberName?: string;
  /** Handler to close the leave board confirmation dialog */
  onCloseLeave: () => void;
  /** Handler to close the delete board confirmation dialog */
  onCloseDelete: () => void;
  /** Handler to close the remove member confirmation dialog */
  onCloseRemoveMember: () => void;
  /** Handler executed when user confirms leaving the board */
  onConfirmLeave: () => void;
  /** Handler executed when user confirms deleting the board */
  onConfirmDelete: () => void;
  /** Handler executed when user confirms removing a member */
  onConfirmRemoveMember: () => void;
}

/**
 * Renders confirmation dialogs for critical board actions like leaving or deleting.
 * This component centralizes the confirmation UI to ensure consistent user experience
 * and prevent accidental destructive actions by requiring explicit user confirmation.
 *
 * @param isLeaveConfirmOpen - Controls visibility of the leave board confirmation dialog
 * @param isDeleteConfirmOpen - Controls visibility of the delete board confirmation dialog
 * @param isRemoveMemberConfirmOpen - Controls visibility of the remove member confirmation dialog
 * @param boardName - Name of the board being acted upon, used in confirmation messages
 * @param memberName - Name of the member to remove, used in confirmation messages
 * @param onCloseLeave - Handler to close the leave board confirmation dialog
 * @param onCloseDelete - Handler to close the delete board confirmation dialog
 * @param onCloseRemoveMember - Handler to close the remove member confirmation dialog
 * @param onConfirmLeave - Handler executed when user confirms leaving the board
 * @param onConfirmDelete - Handler executed when user confirms deleting the board
 * @param onConfirmRemoveMember - Handler executed when user confirms removing a member
 */
const BoardConfirmDialogs: React.FC<BoardConfirmDialogsProps> = ({
  isLeaveConfirmOpen,
  isDeleteConfirmOpen,
  isRemoveMemberConfirmOpen,
  boardName,
  memberName,
  onCloseLeave,
  onCloseDelete,
  onCloseRemoveMember,
  onConfirmLeave,
  onConfirmDelete,
  onConfirmRemoveMember,
}) => {
  const { t } = useTranslation(['board', 'common']);

  return (
    <>
      <ConfirmationDialog
        isOpen={isLeaveConfirmOpen}
        onClose={onCloseLeave}
        onConfirm={onConfirmLeave}
        title={t('board:leaveBoard.confirmTitle')}
        message={t('board:leaveBoard.confirmText', { boardName })}
      />

      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onClose={onCloseDelete}
        onConfirm={onConfirmDelete}
        title={t('board:pictureManager.confirmTitle')}
        message={t('board:pictureManager.confirmText', { boardName })}
      />

      <ConfirmationDialog
        isOpen={isRemoveMemberConfirmOpen}
        onClose={onCloseRemoveMember}
        onConfirm={onConfirmRemoveMember}
        title={t('board:member.removeConfirm.title')}
        message={t('board:member.removeConfirm.message', { userName: memberName })}
      />
    </>
  );
};

export default BoardConfirmDialogs;
