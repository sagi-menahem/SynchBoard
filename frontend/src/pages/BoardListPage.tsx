// File: frontend/src/pages/BoardListPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../components/common/Modal';
import CreateBoardForm from '../components/board/CreateBoardForm';
import Button from '../components/common/Button';
import { APP_ROUTES } from '../constants/routes.constants';
import { COLORS } from '../constants/style.constants';
import { useBoardList } from '../hooks/useBoardList';

const BoardListPage: React.FC = () => {
    const { t } = useTranslation();
    const { boards, isLoading, error, isModalOpen, handleBoardCreated, openModal, closeModal } = useBoardList();

    if (isLoading) {
        return <div>{t('boardListPage.loading')}</div>;
    }

    if (error) {
        return <div style={{ color: COLORS.ERROR }}>{error}</div>;
    }

    return (
        <div style={{ width: '100%', maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1>{t('boardListPage.heading')}</h1>
                <Button onClick={openModal}>
                    {t('boardListPage.createNewBoardButton')}
                </Button>
            </div>

            {boards.length > 0 ? (
                <div className="board-list">
                    {boards.map(board => (
                        <Link key={board.id} to={APP_ROUTES.getBoardDetailRoute(board.id)} style={linkStyle}>
                            <div style={boardCardStyle}>
                                <h2>{board.name}</h2>
                                <p>{board.description || t('boardListPage.noDescription')}</p>
                                {board.isAdmin && <span style={{ color: COLORS.ADMIN_ACCENT }}>{t('boardListPage.adminLabel')}</span>}
                            </div>
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

// Styles
const linkStyle: React.CSSProperties = { textDecoration: 'none', color: 'inherit' };
const boardCardStyle: React.CSSProperties = { backgroundColor: '#2f2f2f', border: '1px solid #444', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', transition: 'background-color 0.2s, transform 0.2s', textAlign: 'left' };

export default BoardListPage;