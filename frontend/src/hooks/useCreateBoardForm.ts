// File: frontend/src/hooks/useCreateBoardForm.ts

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import toast from 'react-hot-toast';
import { createBoard } from '../services/boardService';
import type { Board, CreateBoardRequest } from '../types/board.types';
import { APP_CONFIG } from '../constants/app.constants';

export const useCreateBoardForm = (onBoardCreated: (newBoard: Board) => void) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    // const [error, setError] = useState<string | null>(null); // No longer needed
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
            toast.success(`Board "${newBoard.name}" created!`);
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