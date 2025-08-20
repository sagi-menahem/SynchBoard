import React from 'react';

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
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3>{t('inviteMemberForm.heading')}</h3>
      <div className={styles.field}>
        <label htmlFor="member-email">{t('inviteMemberForm.label')}</label>
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
          {isSubmitting
            ? t('inviteMemberForm.button.sendingInvite')
            : t('inviteMemberForm.button.sendInvite')}
        </Button>
      </div>
    </form>
  );
};

export default InviteMemberForm;
