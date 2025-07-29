// File: frontend/src/hooks/board/details/useModalStates.ts
import { useState } from 'react';

type EditingField = 'name' | 'description';

interface ModalStates {
    isInviteModalOpen: boolean;
    editingField: EditingField | null;
    isLeaveConfirmOpen: boolean;
    isPictureModalOpen: boolean;
    isDeleteConfirmOpen: boolean;
}

interface ModalActions {
    setInviteModalOpen: (open: boolean) => void;
    setEditingField: (field: EditingField | null) => void;
    setLeaveConfirmOpen: (open: boolean) => void;
    setPictureModalOpen: (open: boolean) => void;
    setDeleteConfirmOpen: (open: boolean) => void;
    closeAllModals: () => void;
}

export const useModalStates = (): ModalStates & ModalActions => {
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [editingField, setEditingField] = useState<EditingField | null>(null);
    const [isLeaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
    const [isPictureModalOpen, setPictureModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const closeAllModals = () => {
        setInviteModalOpen(false);
        setEditingField(null);
        setLeaveConfirmOpen(false);
        setPictureModalOpen(false);
        setDeleteConfirmOpen(false);
    };

    return {
        // States
        isInviteModalOpen,
        editingField,
        isLeaveConfirmOpen,
        isPictureModalOpen,
        isDeleteConfirmOpen,

        // Actions
        setInviteModalOpen,
        setEditingField,
        setLeaveConfirmOpen,
        setPictureModalOpen,
        setDeleteConfirmOpen,
        closeAllModals,
    };
};
