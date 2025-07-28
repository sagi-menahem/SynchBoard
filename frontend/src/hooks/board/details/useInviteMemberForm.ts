// File: frontend/src/hooks/board/details/useInviteMemberForm.ts
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import * as boardService from 'services/boardService';
import type { Member } from 'types/board.types';

export const useInviteMemberForm = (boardId: number, onInviteSuccess: (newMember: Member) => void) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!email.trim()) {
            toast.error(t('inviteMemberForm.emailRequiredError'));
            return;
        }
        setIsSubmitting(true);

        boardService
            .inviteMember(boardId, email)
            .then((newMember) => {
                toast.success(t('inviteMemberForm.inviteSuccess', { email }));
                onInviteSuccess(newMember);
                setEmail('');
            })
            .catch((error) => console.error('Failed to invite member:', error))
            .finally(() => setIsSubmitting(false));
    };

    return {
        email,
        setEmail,
        isSubmitting,
        handleSubmit,
    };
};
