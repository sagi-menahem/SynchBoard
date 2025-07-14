// File: frontend/src/components/board/CreateBoardForm.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../common/Input';
import Button from '../common/Button';
import { useCreateBoardForm } from '../../hooks/useCreateBoardForm';
import type { Board } from '../../types/board.types';
import styles from './CreateBoardForm.module.css';

interface CreateBoardFormProps {
    onBoardCreated: (newBoard: Board) => void;
    onClose: () => void;
}

const CreateBoardForm: React.FC<CreateBoardFormProps> = ({ onBoardCreated, onClose }) => {
    const { t } = useTranslation();
    const { name, description, isSubmitting, setName, setDescription, handleSubmit } = useCreateBoardForm(onBoardCreated);

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h3>{t('createBoardForm.heading')}</h3>
            
            <div className={styles.field}>
                <label htmlFor="board-name">{t('createBoardForm.label.boardName')}</label>
                <Input
                    id="board-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder={t('createBoardForm.placeholder.name')} required
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="board-description">{t('createBoardForm.label.description')}</label>
                <textarea
                    id="board-description" value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('createBoardForm.placeholder.description')} rows={3} className={styles.description}
                />
            </div>

            <div className={styles.buttonGroup}>
                <Button type="button" onClick={onClose} disabled={isSubmitting} variant="secondary">
                    {t('common.button.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting} variant="primary">
                    {isSubmitting ? t('common.button.creating') : t('createBoardForm.button.createBoard')}
                </Button>
            </div>
        </form>
    );
};

export default CreateBoardForm;