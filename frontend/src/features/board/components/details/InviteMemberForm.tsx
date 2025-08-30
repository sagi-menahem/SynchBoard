import React from 'react';

import type { UseBoardMemberActionsReturn } from 'features/board/hooks/details/useBoardMemberActions';
import type { Member } from 'features/board/types/BoardTypes';
import { Mail, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'shared/ui';
import styles from 'shared/ui/styles/CommonForm.module.scss';

interface InviteMemberFormProps {
    inviteForm: UseBoardMemberActionsReturn['inviteForm'];
    onInviteSuccess: (newMember: Member) => void;
}

const InviteMemberForm: React.FC<InviteMemberFormProps> = ({ inviteForm, onInviteSuccess }) => {
  const { t } = useTranslation(['board', 'common']);
  const { email, setEmail, isSubmitting, handleSubmit } = inviteForm;

  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>
          <UserPlus size={20} />
          {t('board:inviteMemberForm.heading')}
        </h3>
      </div>
      
      <form onSubmit={(e) => handleSubmit(e, onInviteSuccess)} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="member-email">
            <Mail size={14} />
            {t('board:inviteMemberForm.label')}
          </label>
          <Input
            id="member-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('board:inviteMemberForm.placeholder')}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className={styles.buttonGroup}>
          <Button type="submit" disabled={isSubmitting} variant="cta">
            <UserPlus size={16} />
            {isSubmitting
              ? t('board:inviteMemberForm.button.sendingInvite')
              : t('board:inviteMemberForm.button.sendInvite')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InviteMemberForm;
