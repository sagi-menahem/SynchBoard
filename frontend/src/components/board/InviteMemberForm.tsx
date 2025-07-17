// File: frontend/src/components/board/InviteMemberForm.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Member } from '../../types/board.types';
import { useInviteMemberForm } from '../../hooks/useInviteMemberForm';
import Input from '../common/Input';
import Button from '../common/Button';
import styles from '../common/Form.module.css';

interface InviteMemberFormProps {
    boardId: number;
    onInviteSuccess: (newMember: Member) => void;
}

const InviteMemberForm: React.FC<InviteMemberFormProps> = ({ boardId, onInviteSuccess }) => {
    const { t } = useTranslation(); // <-- Use the translation hook
    const { email, setEmail, isSubmitting, handleSubmit } = useInviteMemberForm(
        boardId,
        onInviteSuccess
    );

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {/* Use translation for the heading */}
            <h3>{t('inviteMemberForm.heading')}</h3>
            <div className={styles.field}>
                {/* Use translation for the label */}
                <label htmlFor="member-email">{t('inviteMemberForm.label')}</label>
                <Input
                    id="member-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    // Use translation for the placeholder
                    placeholder={t('inviteMemberForm.placeholder')}
                    required
                    disabled={isSubmitting}
                />
            </div>
            <div className={styles.buttonGroup}>
                <Button type="submit" disabled={isSubmitting} variant="primary">
                    {/* Use translation for the button text */}
                    {isSubmitting ? t('inviteMemberForm.button.sendingInvite') : t('inviteMemberForm.button.sendInvite')}
                </Button>
            </div>
        </form>
    );
};

export default InviteMemberForm;