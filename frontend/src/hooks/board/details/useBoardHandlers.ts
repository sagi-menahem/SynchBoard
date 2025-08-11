import { useCallback } from 'react';

import logger from 'utils/logger';

import { useBoardLeave } from 'hooks/board/details/useBoardLeave';
import { useBoardMemberActions } from 'hooks/board/details/useBoardMemberActions';
import { useBoardMemberContextMenu } from 'hooks/board/details/useBoardMemberContextMenu';
import { useBoardPictureManager } from 'hooks/board/details/useBoardPictureManager';
import type { BoardDetails, Member } from 'types/BoardTypes';


interface BoardHandlersProps {
    boardId: number;
    boardDetails: BoardDetails | null;
    currentUserIsAdmin: boolean;
    refetch: () => void;
    onInviteSuccess: () => void;
    onLeaveComplete: () => void;
    onPictureUploadComplete: () => void;
    onPromptPictureDelete: () => void;
    onDeletePictureComplete: () => void;
}

export const useBoardHandlers = ({
    boardId,
    boardDetails,
    currentUserIsAdmin,
    refetch,
    onInviteSuccess,
    onLeaveComplete,
    onPictureUploadComplete,
    onPromptPictureDelete,
    onDeletePictureComplete,
}: BoardHandlersProps) => {
    const { handleLeaveBoard } = useBoardLeave(boardId);
    const { handlePictureUpload, handlePictureDelete } = useBoardPictureManager(boardId, refetch);
    const { handlePromote, handleRemove } = useBoardMemberActions(boardId, refetch);
    const { contextMenu, handleRightClick } = useBoardMemberContextMenu(currentUserIsAdmin);

    const handleInviteSuccess = useCallback(
        (newMember: Member) => {
            logger.debug('New member invited:', newMember);
            refetch();
            onInviteSuccess();
        },
        [refetch, onInviteSuccess]
    );

    const handlePromoteWithCleanup = useCallback(async () => {
        if (!contextMenu.data) return;
        try {
            await handlePromote(contextMenu.data);
        } finally {
            contextMenu.closeMenu();
        }
    }, [contextMenu, handlePromote]);

    const handleRemoveWithCleanup = useCallback(async () => {
        if (!contextMenu.data) return;
        try {
            await handleRemove(contextMenu.data);
        } finally {
            contextMenu.closeMenu();
        }
    }, [contextMenu, handleRemove]);

    const handleLeaveWithCleanup = useCallback(async () => {
        try {
            await handleLeaveBoard(boardDetails);
        } finally {
            onLeaveComplete();
        }
    }, [handleLeaveBoard, boardDetails, onLeaveComplete]);

    const handlePictureUploadWithCleanup = useCallback(
        async (file: File) => {
            try {
                await handlePictureUpload(file);
            } finally {
                onPictureUploadComplete();
            }
        },
        [handlePictureUpload, onPictureUploadComplete]
    );

    const promptPictureDelete = useCallback(() => {
        onPromptPictureDelete();
    }, [onPromptPictureDelete]);

    const handleConfirmDeletePicture = useCallback(async () => {
        try {
            await handlePictureDelete();
        } finally {
            onDeletePictureComplete();
        }
    }, [handlePictureDelete, onDeletePictureComplete]);

    return {
        contextMenu,
        handleInviteSuccess,
        handlePromote: handlePromoteWithCleanup,
        handleRemove: handleRemoveWithCleanup,
        handleRightClick,
        handleLeaveBoard: handleLeaveWithCleanup,
        handlePictureUpload: handlePictureUploadWithCleanup,
        promptPictureDelete,
        handleConfirmDeletePicture,
    };
};
