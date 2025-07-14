// File: frontend/src/pages/BoardListPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../components/common/Modal';
import CreateBoardForm from '../components/board/CreateBoardForm';
import Button from '../components/common/Button';
import { APP_ROUTES } from '../constants/routes.constants';
import { useBoardList } from '../hooks/useBoardList';
import styles from './BoardListPage.module.css';

const BoardListPage: React.FC = () => {
    const { t } = useTranslation();
    const { boards, isLoading, isModalOpen, handleBoardCreated, openModal, closeModal } = useBoardList();

    if (isLoading) {
        return <div>{t('boardListPage.loading')}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>{t('boardListPage.heading')}</h1>
                <Button onClick={openModal}>
                    {t('boardListPage.createNewBoardButton')}
                </Button>
            </div>

            {boards.length > 0 ? (
                <div className={styles.boardList}>
                    {boards.map(board => (
                        <Link key={board.id} to={APP_ROUTES.getBoardDetailRoute(board.id)} className={styles.boardCard}>
                            <h2>{board.name}</h2>
                            <p>{board.description || t('boardListPage.noDescription')}</p>
                            {board.isAdmin && <span className={styles.adminLabel}>{t('boardListPage.adminLabel')}</span>}
                        </Link>
                    ))}
                </div>
            ) : (
                <p>{t('boardListPage.noBoardsMessage')}</p>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <CreateBoardForm 
                    onBoardCreated={handleBoardCreated}
                    onClose={closeModal}
                />
            </Modal>
        </div>
    );
};

export default BoardListPage;