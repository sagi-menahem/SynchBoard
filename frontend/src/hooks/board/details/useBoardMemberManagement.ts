import { useCallback } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import { useAuth } from 'hooks/auth/useAuth';
import { useContextMenu } from 'hooks/common/useContextMenu';
import * as boardService from 'services/boardService';
import type { Member } from 'types/BoardTypes';

export const useBoardMemberManagement = (boardId: number, currentUserIsAdmin: boolean) => {
  const { t } = useTranslation();
  const { userEmail } = useAuth();
  const contextMenu = useContextMenu<Member>();

  const handlePromote = useCallback(
    async (member: Member) => {
      try {
        await boardService.promoteMember(boardId, member.email);
        toast.success(t('promoteSuccess', { userName: member.firstName }));
      } catch (error) {
        logger.error('Failed to promote member:', error);
        throw error;
      }
    },
    [boardId, t],
  );

  const handleRemove = useCallback(
    async (member: Member) => {
      try {
        await boardService.removeMember(boardId, member.email);
        toast.success(t('removeSuccess', { userName: member.firstName }));
      } catch (error) {
        logger.error('Failed to remove member:', error);
        throw error;
      }
    },
    [boardId, t],
  );

  const handleInvite = useCallback(
    async (email: string) => {
      try {
        const newMember = await boardService.inviteMember(boardId, email);
        toast.success(t('inviteMemberForm.inviteSuccess', { email }));
        return newMember;
      } catch (error) {
        logger.error('Failed to invite member:', error);
        throw error;
      }
    },
    [boardId, t],
  );

  const handleRightClick = useCallback(
    (event: React.MouseEvent, member: Member) => {
      event.preventDefault();
      if (currentUserIsAdmin && member.email !== userEmail) {
        contextMenu.handleContextMenu(event, member);
      }
    },
    [currentUserIsAdmin, userEmail, contextMenu],
  );

  return {
    contextMenu,
    handlePromote,
    handleRemove,
    handleInvite,
    handleRightClick,
  };
};