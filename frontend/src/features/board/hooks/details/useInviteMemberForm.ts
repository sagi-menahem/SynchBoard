import { useState } from 'react';

import { useBoardMemberManagement } from 'features/board/hooks/details/useBoardMemberManagement';
import type { Member } from 'features/board/types/BoardTypes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'shared/utils/logger';



export const useInviteMemberForm = (boardId: number, onInviteSuccess: (newMember: Member) => void) => {
  const { t } = useTranslation(['board', 'common']);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleInvite } = useBoardMemberManagement(boardId, false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      logger.warn('[useInviteMemberForm] Email validation failed - empty email');
      toast.error(t('board:inviteMemberForm.emailRequiredError'));
      return;
    }
    setIsSubmitting(true);

    try {
      const newMember = await handleInvite(email);
      onInviteSuccess(newMember);
      setEmail('');
    } catch (error) {
      logger.error('[useInviteMemberForm] Failed to invite member:', error);
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
