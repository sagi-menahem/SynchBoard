import { useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import { APP_CONFIG } from 'constants/app.constants';
import { createBoard } from 'services/boardService';
import type { Board, CreateBoardRequest } from 'types/board.types';


export const useCreateBoardForm = (onBoardCreated: (newBoard: Board) => void) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (name.trim().length < APP_CONFIG.MIN_BOARD_NAME_LENGTH) {
            toast.error(t('createBoardForm.nameLengthError'));
            return;
        }
        setIsSubmitting(true);
        const boardData: CreateBoardRequest = { name, description };

        createBoard(boardData)
            .then((newBoard) => {
                toast.success(t('createBoardSuccess', { boardName: newBoard.name }));
                onBoardCreated(newBoard);
            })
            .catch((err) => logger.error(err))
            .finally(() => setIsSubmitting(false));
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
