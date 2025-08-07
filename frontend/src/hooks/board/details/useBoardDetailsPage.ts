import { useBoardDetails } from 'hooks/board/details/useBoardDetails';
import { useBoardEditing } from 'hooks/board/details/useBoardEditing';
import { useBoardHandlers } from 'hooks/board/details/useBoardHandlers';
import { useBoardPermissions } from 'hooks/board/details/useBoardPermissions';
import { useModalStates } from 'hooks/board/details/useModalStates';

export const useBoardDetailsPage = (boardId: number) => {
    const { boardDetails, isLoading, refetch } = useBoardDetails(boardId);
    const { handleUpdateName, handleUpdateDescription } = useBoardEditing(boardId, refetch);

    const { currentUserIsAdmin, userEmail } = useBoardPermissions(boardDetails);

    const {
        isInviteModalOpen,
        editingField,
        isLeaveConfirmOpen,
        isPictureModalOpen,
        isDeleteConfirmOpen,
        setInviteModalOpen,
        setEditingField,
        setLeaveConfirmOpen,
        setPictureModalOpen,
        setDeleteConfirmOpen,
    } = useModalStates();

    const {
        contextMenu,
        handleInviteSuccess,
        handlePromote,
        handleRemove,
        handleRightClick,
        handleLeaveBoard,
        handlePictureUpload,
        promptPictureDelete,
        handleConfirmDeletePicture,
    } = useBoardHandlers({
        boardId,
        boardDetails,
        currentUserIsAdmin,
        refetch,
        onInviteSuccess: () => setInviteModalOpen(false),
        onLeaveComplete: () => setLeaveConfirmOpen(false),
        onPictureUploadComplete: () => setPictureModalOpen(false),
        onPromptPictureDelete: () => {
            setPictureModalOpen(false);
            setDeleteConfirmOpen(true);
        },
        onDeletePictureComplete: () => setDeleteConfirmOpen(false),
    });

    return {
        isLoading,
        boardDetails,
        userEmail,
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
    };
};
