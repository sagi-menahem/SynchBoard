import { useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/Logger';

import { useBoardMemberActions } from 'hooks/board/details/useBoardMemberActions';
import type { Member } from 'types/BoardTypes';


export const useInviteMemberForm = (boardId: number, onInviteSuccess: (newMember: Member) => void) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { handleInvite } = useBoardMemberActions(boardId);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!email.trim()) {
            toast.error(t('inviteMemberForm.emailRequiredError'));
            return;
        }
        setIsSubmitting(true);

        try {
            const newMember = await handleInvite(email);
            onInviteSuccess(newMember);
            setEmail('');
        } catch (error) {
            logger.error('Invite member failed:', error);
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
