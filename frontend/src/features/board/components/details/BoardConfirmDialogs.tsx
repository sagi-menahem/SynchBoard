import React from 'react';

import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from 'shared/ui';

interface BoardConfirmDialogsProps {
    isLeaveConfirmOpen: boolean;
    isDeleteConfirmOpen: boolean;
    boardName: string;
    onCloseLeave: () => void;
    onCloseDelete: () => void;
    onConfirmLeave: () => void;
    onConfirmDelete: () => void;
}

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
                title={t('common:pictureManager.deleteButton')}
                message={t('board:leaveBoard.confirmText', { boardName })}
            />
        </>
    );
};

export default BoardConfirmDialogs;
