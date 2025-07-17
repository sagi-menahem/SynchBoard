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
import { ContextMenu } from '../components/common/ContextMenu';
import { ContextMenuItem } from '../components/common/ContextMenuItem';
import ConfirmationDialog from '../components/common/ConfirmationDialog';

const BoardListPage: React.FC = () => {
    const { t } = useTranslation();
    const {
        boards,
        isLoading,
        isModalOpen,
        contextMenu,
        isLeaveConfirmOpen,
        setLeaveConfirmOpen,
        boardToLeave, // Use the new state variable
        handleBoardCreated,
        openModal,
        closeModal,
        handleConfirmLeave,
        handleLeaveClick,
    } = useBoardList();

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
                        <div
                            key={board.id}
                            onContextMenu={(e) => contextMenu.handleContextMenu(e, board)}
                        >
                            <Link
                                to={APP_ROUTES.getBoardDetailRoute(board.id)}
                                className={styles.boardCard}
                            >
                                <h2>{board.name}</h2>
                                <p>{board.description || t('boardListPage.noDescription')}</p>
                                {board.isAdmin && <span className={styles.adminLabel}>{t('boardListPage.adminLabel')}</span>}
                            </Link>
                        </div>
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

            {contextMenu.isOpen && (
                <ContextMenu
                    x={contextMenu.anchorPoint.x}
                    y={contextMenu.anchorPoint.y}
                    onClose={contextMenu.closeMenu}
                >
                    <ContextMenuItem onClick={handleLeaveClick} destructive>
                        {t('leaveBoard.button')}
                    </ContextMenuItem>
                </ContextMenu>
            )}

            {/* --- FIX THE RENDERING CONDITION HERE --- */}
            {/* We now check boardToLeave instead of contextMenu.data */}
            {boardToLeave && (
                <ConfirmationDialog
                    isOpen={isLeaveConfirmOpen}
                    onClose={() => {
                        setLeaveConfirmOpen(false);
                        // No need to close the context menu here, it's already closed.
                    }}
                    onConfirm={handleConfirmLeave}
                    title={t('leaveBoard.confirmTitle')}
                    // And we get the name from boardToLeave
                    message={t('leaveBoard.confirmText', { boardName: boardToLeave.name })}
                />
            )}
        </div>
    );
};

export default BoardListPage;