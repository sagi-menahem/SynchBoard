import React, { useState, type KeyboardEvent } from 'react';

import { useMemberValidation } from 'features/board/hooks/management/useMemberValidation';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'shared/ui';
import { validateEmail } from 'shared/utils/validationUtils';

import styles from './MemberInviteInput.module.scss';

interface MemberInviteInputProps {
  onMembersChange: (emails: string[]) => void;
  disabled?: boolean;
  id?: string;
}

const MemberInviteInput: React.FC<MemberInviteInputProps> = ({
  onMembersChange,
  disabled = false,
  id,
}) => {
  const { t } = useTranslation(['board', 'common']);
  const [inputValue, setInputValue] = useState('');
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);

  const { validateMemberEmail } = useMemberValidation();

  const addEmail = async (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      return;
    }

    const validation = await validateMemberEmail(trimmedEmail, inviteEmails);
    if (!validation.isValid) {
      return;
    }

    const newEmails = [...inviteEmails, trimmedEmail];
    setInviteEmails(newEmails);
    onMembersChange(newEmails);
    setInputValue('');
  };

  const removeEmail = (emailToRemove: string) => {
    const newEmails = inviteEmails.filter((email) => email !== emailToRemove);
    setInviteEmails(newEmails);
    onMembersChange(newEmails);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      void addEmail(inputValue);
    }
  };

  const handleAddClick = () => {
    void addEmail(inputValue);
  };

  return (
    <div className={styles.container} id={id}>
      <label htmlFor="member-invite-email" className="sr-only">
        {t('board:createForm.placeholder.inviteEmails')}
      </label>
      <div className={styles.inputContainer}>
        <Input
          id="member-invite-email"
          type="email"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={t('board:createForm.placeholder.inviteEmails')}
          disabled={disabled}
        />
        <Button
          type="button"
          onClick={handleAddClick}
          disabled={disabled || !inputValue.trim() || !validateEmail(inputValue)}
          variant="secondary"
          className={styles.addButton}
        >
          {t('board:createForm.addMember')}
        </Button>
      </div>

      {inviteEmails.length > 0 && (
        <div className={styles.emailTags}>
          {inviteEmails.map((email) => (
            <div key={email} className={styles.emailTag}>
              <span>{email}</span>
              {!disabled && (
                <Button
                  variant="icon"
                  type="button"
                  onClick={() => removeEmail(email)}
                  className={styles.removeTag}
                  aria-label={t('board:createForm.removeMember', { email })}
                >
                  ×
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {inviteEmails.length > 0 && (
        <p className={styles.helpText}>
          {t('board:createForm.inviteCount', { count: inviteEmails.length })}
        </p>
      )}
    </div>
  );
};

export default MemberInviteInput;
