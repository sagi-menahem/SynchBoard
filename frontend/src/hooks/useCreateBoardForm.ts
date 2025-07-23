// File: frontend/src/hooks/useCreateBoardForm.ts
import axios from 'axios';
import { APP_CONFIG } from 'constants/app.constants';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { createBoard } from 'services/boardService';
import type { Board, CreateBoardRequest } from 'types/board.types';

export const useCreateBoardForm = (onBoardCreated: (newBoard: Board) => void) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (name.trim().length < APP_CONFIG.MIN_BOARD_NAME_LENGTH) {
            toast.error(t('createBoardForm.nameLengthError'));
            return;
        }
        setIsSubmitting(true);
        const boardData: CreateBoardRequest = { name, description };
        try {
            const newBoard = await createBoard(boardData);
            toast.success(t('createBoardSuccess', { boardName: newBoard.name }));
            onBoardCreated(newBoard);
        } catch (err) {
            let errorMessage = t('createBoardForm.failedError');
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            console.error(err);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        name,
        description,
        isSubmitting,
        setName,
        setDescription,
        handleSubmit,
    };
};