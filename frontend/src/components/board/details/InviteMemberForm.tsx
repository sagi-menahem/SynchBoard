import React from 'react';

import { Mail, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Button from 'components/common/Button';
import styles from 'components/common/CommonForm.module.css';
import Input from 'components/common/Input';
import { useInviteMemberForm } from 'hooks/board/details/useInviteMemberForm';
import type { Member } from 'types/BoardTypes';

interface InviteMemberFormProps {
    boardId: number;
    onInviteSuccess: (newMember: Member) => void;
}

const InviteMemberForm: React.FC<InviteMemberFormProps> = ({ boardId, onInviteSuccess }) => {
  const { t } = useTranslation();
  const { email, setEmail, isSubmitting, handleSubmit } = useInviteMemberForm(boardId, onInviteSuccess);

  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>
          <UserPlus size={20} />
          {t('inviteMemberForm.heading')}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="member-email">
            <Mail size={14} />
            {t('inviteMemberForm.label')}
          </label>
          <Input
            id="member-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('inviteMemberForm.placeholder')}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className={styles.buttonGroup}>
          <Button type="submit" disabled={isSubmitting} variant="primary">
            <UserPlus size={16} />
            {isSubmitting
              ? t('inviteMemberForm.button.sendingInvite')
              : t('inviteMemberForm.button.sendInvite')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InviteMemberForm;
