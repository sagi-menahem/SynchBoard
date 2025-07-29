// File: frontend/src/components/board/details/BoardEditModals.tsx
import EditFieldForm from 'components/board/details/EditFieldForm';
import InviteMemberForm from 'components/board/details/InviteMemberForm';
import Modal from 'components/common/Modal';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Member } from 'types/board.types';

interface BoardEditModalsProps {
    isInviteModalOpen: boolean;
    editingField: 'name' | 'description' | null;
    boardId: number;
    boardName: string;
    boardDescription: string;
    onCloseInvite: () => void;
    onCloseEdit: () => void;
    onInviteSuccess: (member: Member) => void;
    onUpdateName: (name: string) => Promise<void>;
    onUpdateDescription: (description: string) => Promise<void>;
}

const BoardEditModals: React.FC<BoardEditModalsProps> = ({
    isInviteModalOpen,
    editingField,
    boardId,
    boardName,
    boardDescription,
    onCloseInvite,
    onCloseEdit,
    onInviteSuccess,
    onUpdateName,
    onUpdateDescription,
}) => {
    const { t } = useTranslation();

    return (
        <>
            <Modal isOpen={isInviteModalOpen} onClose={onCloseInvite}>
                <InviteMemberForm boardId={boardId} onInviteSuccess={onInviteSuccess} />
            </Modal>

            <Modal isOpen={editingField !== null} onClose={onCloseEdit}>
                {editingField === 'name' && (
                    <EditFieldForm
                        title={t('editBoardNameForm.title')}
                        label={t('editBoardNameForm.label')}
                        initialValue={boardName}
                        onSave={onUpdateName}
                        onClose={onCloseEdit}
                    />
                )}
                {editingField === 'description' && (
                    <EditFieldForm
                        title={t('editBoardDescriptionForm.title')}
                        label={t('editBoardDescriptionForm.label')}
                        initialValue={boardDescription || ''}
                        inputType="textarea"
                        onSave={onUpdateDescription}
                        onClose={onCloseEdit}
                    />
                )}
            </Modal>
        </>
    );
};

export default BoardEditModals;
