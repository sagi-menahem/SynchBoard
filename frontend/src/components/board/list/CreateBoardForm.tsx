import React, { useState, startTransition } from 'react';

import { useTranslation } from 'react-i18next';

import { Button, Input } from 'components/common';
import styles from 'components/common/CommonForm.module.css';
import { useCreateBoardForm } from 'hooks/board/management';
import type { Board } from 'types/BoardTypes';

import BoardImageUpload from './BoardImageUpload';
import MemberInviteInput from './MemberInviteInput';

interface CreateBoardFormProps {
    onBoardCreated: (newBoard: Board) => void;
    onClose: () => void;
}

const CreateBoardForm: React.FC<CreateBoardFormProps> = ({ onBoardCreated, onClose }) => {
  const { t } = useTranslation();
  const { state, submitAction, isPending } = useCreateBoardForm(onBoardCreated);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    
    // Add image if selected
    if (selectedImage) {
      formData.append('picture', selectedImage);
    }
    
    // Add invite emails
    inviteEmails.forEach((email) => {
      formData.append('inviteEmails', email);
    });
    
    startTransition(() => {
      submitAction(formData);
    });
  };

  return (
    <form onSubmit={handleFormSubmit} className={styles.form}>
      <h3>{t('createBoardForm.heading')}</h3>

      {state.error && (
        <div className={styles.error} role="alert">
          {state.error}
        </div>
      )}

      <div className={styles.imageField}>
        <BoardImageUpload onImageSelect={setSelectedImage} disabled={isPending} />
      </div>

      <div className={styles.field}>
        <label htmlFor="board-name">{t('createBoardForm.label.boardName')}</label>
        <Input
          id="board-name"
          name="name"
          type="text"
          placeholder={t('createBoardForm.placeholder.name')}
          required
          disabled={isPending}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="board-description">{t('createBoardForm.label.description')}</label>
        <textarea
          id="board-description"
          name="description"
          placeholder={t('createBoardForm.placeholder.description')}
          rows={3}
          className={styles.description}
          disabled={isPending}
        />
      </div>

      <div className={styles.field}>
        <label>{t('createBoardForm.label.inviteMembers')}</label>
        <MemberInviteInput onMembersChange={setInviteEmails} disabled={isPending} />
      </div>

      <div className={styles.buttonGroup}>
        <Button type="button" onClick={onClose} disabled={isPending} variant="secondary">
          {t('common.button.cancel')}
        </Button>
        <Button type="submit" disabled={isPending} variant="primary">
          {isPending ? t('common.button.creating') : t('createBoardForm.button.createBoard')}
        </Button>
      </div>
    </form>
  );
};

export default CreateBoardForm;
