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
  /** Name of the board being acted upon, used in confirmation messages */
  boardName: string;
  /** Handler to close the leave board confirmation dialog */
  onCloseLeave: () => void;
  /** Handler to close the delete board confirmation dialog */
  onCloseDelete: () => void;
  /** Handler executed when user confirms leaving the board */
  onConfirmLeave: () => void;
  /** Handler executed when user confirms deleting the board */
  onConfirmDelete: () => void;
}

/**
 * Renders confirmation dialogs for critical board actions like leaving or deleting.
 * This component centralizes the confirmation UI to ensure consistent user experience 
 * and prevent accidental destructive actions by requiring explicit user confirmation.
 * 
 * @param isLeaveConfirmOpen - Controls visibility of the leave board confirmation dialog
 * @param isDeleteConfirmOpen - Controls visibility of the delete board confirmation dialog
 * @param boardName - Name of the board being acted upon, used in confirmation messages
 * @param onCloseLeave - Handler to close the leave board confirmation dialog
 * @param onCloseDelete - Handler to close the delete board confirmation dialog
 * @param onConfirmLeave - Handler executed when user confirms leaving the board
 * @param onConfirmDelete - Handler executed when user confirms deleting the board
 */
const BoardConfirmDialogs: React.FC<BoardConfirmDialogsProps> = ({
  isLeaveConfirmOpen,
  isDeleteConfirmOpen,
  boardName,
  onCloseLeave,
  onCloseDelete,
  onConfirmLeave,
  onConfirmDelete,
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
    </>
  );
};

export default BoardConfirmDialogs;
