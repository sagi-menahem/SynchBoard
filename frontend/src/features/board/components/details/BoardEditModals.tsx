import React from 'react';

import type { Member } from 'features/board/types/BoardTypes';
import { useTranslation } from 'react-i18next';
import { Modal } from 'shared/ui';

import { EditFieldForm, InviteMemberForm } from '.';

interface BoardEditModalsProps {
    isInviteModalOpen: boolean;
    editingField: 'name' | null;
    boardId: number;
    boardName: string;
    onCloseInvite: () => void;
    onCloseEdit: () => void;
    onInviteSuccess: (member: Member) => void;
    onUpdateName: (name: string) => Promise<void>;
}

const BoardEditModals: React.FC<BoardEditModalsProps> = ({
    isInviteModalOpen,
    editingField,
    boardId,
    boardName,
    onCloseInvite,
    onCloseEdit,
    onInviteSuccess,
    onUpdateName,
}) => {
    const { t } = useTranslation();

    return (
        <>
            <Modal isOpen={isInviteModalOpen} onClose={onCloseInvite}>
                <InviteMemberForm boardId={boardId} onInviteSuccess={onInviteSuccess} />
            </Modal>

            <Modal isOpen={editingField === 'name'} onClose={onCloseEdit}>
                <EditFieldForm
                    title={t('editBoardNameForm.title')}
                    label={t('editBoardNameForm.label')}
                    initialValue={boardName}
                    onSave={onUpdateName}
                    onClose={onCloseEdit}
                />
            </Modal>
        </>
    );
};

export default BoardEditModals;
