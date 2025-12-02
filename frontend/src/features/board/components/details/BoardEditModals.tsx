import type { UseBoardMemberActionsReturn } from 'features/board/hooks/details/useBoardMemberActions';
import type { Member } from 'features/board/types/BoardTypes';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'shared/ui';

import { EditFieldForm, InviteMemberForm } from '.';

/**
 * Props interface for BoardEditModals component.
 * Defines the modal states and event handlers for board editing operations.
 */
interface BoardEditModalsProps {
  /** Controls visibility of the member invitation modal */
  isInviteModalOpen: boolean;
  /** Indicates which field is currently being edited, null when no editing */
  editingField: 'name' | null;
  /** Current name of the board being edited */
  boardName: string;
  /** Form state and handlers from useBoardMemberActions hook for inviting members */
  inviteForm: UseBoardMemberActionsReturn['inviteForm'];
  /** Handler to close the member invitation modal */
  onCloseInvite: () => void;
  /** Handler to close the field editing modal */
  onCloseEdit: () => void;
  /** Handler executed when member invitation succeeds with new member data */
  onInviteSuccess: (member: Member) => void;
  /** Handler for updating the board name with async validation */
  onUpdateName: (name: string) => Promise<void>;
}

/**
 * Container component that manages modal dialogs for board editing operations.
 * This component centralizes modal state management to provide consistent modal
 * behavior for member invitations and field editing across the board details interface.
 *
 * @param isInviteModalOpen - Controls visibility of the member invitation modal
 * @param editingField - Indicates which field is currently being edited, null when no editing
 * @param boardName - Current name of the board being edited
 * @param inviteForm - Form state and handlers from useBoardMemberActions hook for inviting members
 * @param onCloseInvite - Handler to close the member invitation modal
 * @param onCloseEdit - Handler to close the field editing modal
 * @param onInviteSuccess - Handler executed when member invitation succeeds with new member data
 * @param onUpdateName - Handler for updating the board name with async validation
 */
const BoardEditModals: React.FC<BoardEditModalsProps> = ({
  isInviteModalOpen,
  editingField,
  boardName,
  inviteForm,
  onCloseInvite,
  onCloseEdit,
  onInviteSuccess,
  onUpdateName,
}) => {
  const { t } = useTranslation(['board', 'common']);

  return (
    <>
      <Modal isOpen={isInviteModalOpen} onClose={onCloseInvite}>
        <InviteMemberForm inviteForm={inviteForm} onInviteSuccess={onInviteSuccess} />
      </Modal>

      <Modal isOpen={editingField === 'name'} onClose={onCloseEdit}>
        <EditFieldForm
          title={t('board:editNameForm.title')}
          label={t('board:editNameForm.label')}
          initialValue={boardName}
          onSave={onUpdateName}
          onClose={onCloseEdit}
        />
      </Modal>
    </>
  );
};

export default BoardEditModals;
