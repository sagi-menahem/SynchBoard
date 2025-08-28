import React from 'react';

import { useInviteMemberForm } from 'features/board/hooks/details/useInviteMemberForm';
import type { Member } from 'features/board/types/BoardTypes';
import { Mail, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'shared/ui';
import styles from 'shared/ui/CommonForm.module.css';

interface InviteMemberFormProps {
    boardId: number;
    onInviteSuccess: (newMember: Member) => void;
}

const InviteMemberForm: React.FC<InviteMemberFormProps> = ({ boardId, onInviteSuccess }) => {
  const { t } = useTranslation(['board', 'common']);
  const { email, setEmail, isSubmitting, handleSubmit } = useInviteMemberForm(boardId, onInviteSuccess);

  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>
          <UserPlus size={20} />
          {t('board:inviteMemberForm.heading')}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.form}>
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
          <Button type="submit" disabled={isSubmitting} variant="primary">
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
