import type { KeyboardEvent } from 'react';
import React, { useState } from 'react';

import { useAuth } from 'features/auth/hooks/useAuth';
import { checkUserExists } from 'features/settings/services/userService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'shared/ui';
import logger from 'shared/utils/logger';
import { validateEmail } from 'shared/utils/validationUtils';


import styles from './MemberInviteInput.module.css';

interface MemberInviteInputProps {
    onMembersChange: (emails: string[]) => void;
    disabled?: boolean;
}

const MemberInviteInput: React.FC<MemberInviteInputProps> = ({ onMembersChange, disabled = false }) => {
  const { t } = useTranslation(['board', 'common']);
  const { userEmail } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);


  const addEmail = async (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) return;
    
    if (!validateEmail(trimmedEmail)) {
      toast.error(t('board:createBoardForm.invalidEmail'));
      return;
    }

    if (userEmail && trimmedEmail === userEmail.toLowerCase()) {
      toast.error(t('board:createBoardForm.cannotInviteSelf'));
      return;
    }
    
    if (inviteEmails.includes(trimmedEmail)) {
      toast.error(t('board:createBoardForm.emailAlreadyAdded'));
      return;
    }

    try {
      const userExists = await checkUserExists(trimmedEmail);
      if (!userExists) {
        toast.error(t('board:createBoardForm.userNotFound', { email: trimmedEmail }));
        return;
      }

      const newEmails = [...inviteEmails, trimmedEmail];
      setInviteEmails(newEmails);
      onMembersChange(newEmails);
      setInputValue('');
    } catch (error) {
      logger.error('Error checking user existence:', error);
      toast.error(t('board:createBoardForm.errorCheckingUser'));
    }
  };

  const removeEmail = (emailToRemove: string) => {
    const newEmails = inviteEmails.filter((email) => email !== emailToRemove);
    setInviteEmails(newEmails);
    onMembersChange(newEmails);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addEmail(inputValue);
    }
  };

  const handleAddClick = () => {
    addEmail(inputValue);
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputContainer}>
        <Input
          type="email"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={t('board:createBoardForm.placeholder.inviteEmails')}
          disabled={disabled}
        />
        <Button
          type="button"
          onClick={handleAddClick}
          disabled={disabled || !inputValue.trim() || !validateEmail(inputValue)}
          variant="secondary"
          className={styles.addButton}
        >
          {t('board:createBoardForm.addMember')}
        </Button>
      </div>
      
      {inviteEmails.length > 0 && (
        <div className={styles.emailTags}>
          {inviteEmails.map((email) => (
            <div key={email} className={styles.emailTag}>
              <span>{email}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeEmail(email)}
                  className={styles.removeTag}
                  aria-label={t('board:createBoardForm.removeMember', { email })}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {inviteEmails.length > 0 && (
        <p className={styles.helpText}>
          {t('board:createBoardForm.inviteCount', { count: inviteEmails.length })}
        </p>
      )}
    </div>
  );
};

export default MemberInviteInput;