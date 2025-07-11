// File: frontend/src/components/board/CreateBoardForm.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { createBoard } from '../../services/boardService';
import type { Board, CreateBoardRequest } from '../../types/board.types';
import Input from '../common/Input';
import Button from '../common/Button';

interface CreateBoardFormProps {
    onBoardCreated: (newBoard: Board) => void;
    onClose: () => void;
}

const CreateBoardForm: React.FC<CreateBoardFormProps> = ({ onBoardCreated, onClose }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        if (name.trim().length < 3) {
            setError(t('createBoardForm.nameLengthError'));
            return;
        }
        setIsSubmitting(true);
        const boardData: CreateBoardRequest = { name, description };
        try {
            const newBoard = await createBoard(boardData);
            onBoardCreated(newBoard);
        } catch (err) {
            let errorMessage = t('createBoardForm.failedError');
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            console.error(err);
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const sharedInputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px',
        marginTop: '4px',
        boxSizing: 'border-box',
        backgroundColor: '#333',
        border: '1px solid #555',
        borderRadius: '4px',
        color: '#fff',
        fontFamily: 'inherit',
        fontSize: 'inherit',
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>{t('createBoardForm.heading')}</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <div>
                <label htmlFor="board-name">{t('createBoardForm.label.boardName')}</label>
                <Input
                    id="board-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('createBoardForm.placeholder.name')}
                    required
                />
            </div>

            <div style={{ marginTop: '1rem' }}>
                <label htmlFor="board-description">{t('createBoardForm.label.description')}</label>
                <textarea
                    id="board-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('createBoardForm.placeholder.description')}
                    rows={3}
                    style={sharedInputStyle}
                />
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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