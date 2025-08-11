import { useCallback } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import * as boardService from 'services/BoardService';
import type { Member } from 'types/board.types';


export const useBoardMemberActions = (boardId: number, onSuccess?: () => void) => {
    const { t } = useTranslation();

    const handlePromote = useCallback(
        async (member: Member) => {
            try {
                await boardService.promoteMember(boardId, member.email);
                toast.success(t('promoteSuccess', { userName: member.firstName }));
                onSuccess?.();
            } catch (error) {
                logger.error('Failed to promote member:', error);
                throw error;
            }
        },
        [boardId, onSuccess, t]
    );

    const handleRemove = useCallback(
        async (member: Member) => {
            try {
                await boardService.removeMember(boardId, member.email);
                toast.success(t('removeSuccess', { userName: member.firstName }));
                onSuccess?.();
            } catch (error) {
                logger.error('Failed to remove member:', error);
                throw error;
            }
        },
        [boardId, onSuccess, t]
    );

    const handleInvite = useCallback(
        async (email: string) => {
            try {
                const newMember = await boardService.inviteMember(boardId, email);
                toast.success(t('inviteMemberForm.inviteSuccess', { email }));
                onSuccess?.();
                return newMember;
            } catch (error) {
                logger.error('Failed to invite member:', error);
                throw error;
            }
        },
        [boardId, onSuccess, t]
    );

    return {
        handlePromote,
        handleRemove,
        handleInvite,
    };
};
