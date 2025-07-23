// File: frontend/src/hooks/useInviteMemberForm.ts
import { AxiosError } from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import * as boardService from 'services/boardService';
import type { Member } from 'types/board.types';

export const useInviteMemberForm = (boardId: number, onInviteSuccess: (newMember: Member) => void) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!email.trim()) {
            toast.error(t('inviteMemberForm.emailRequiredError'));
            return;
        }

        setIsSubmitting(true);
        try {
            const newMember = await boardService.inviteMember(boardId, email);
            toast.success(t('inviteMemberForm.inviteSuccess', { email }));
            onInviteSuccess(newMember);
            setEmail('');
        } catch (error) {
            console.error("Failed to invite member:", error);
            let errorMessage = t('inviteMemberForm.genericError');
            if (error instanceof AxiosError && error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        email,
        setEmail,
        isSubmitting,
        handleSubmit,
    };
};