import React from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import BoardCard from 'components/board/list/BoardCard';
import CreateBoardForm from 'components/board/list/CreateBoardForm';
import Button from 'components/common/Button';
import ConfirmationDialog from 'components/common/ConfirmationDialog';
import { ContextMenu } from 'components/common/ContextMenu';
import { ContextMenuItem } from 'components/common/ContextMenuItem';
import Modal from 'components/common/Modal';
import { APP_ROUTES } from 'constants/routes.constants';
import { useBoardList } from 'hooks/board/management/useBoardList';

import styles from './BoardListPage.module.css';

const BoardListPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const {
        boards,
        isLoading,
        isModalOpen,
        contextMenu,
        isLeaveConfirmOpen,
        setLeaveConfirmOpen,
        boardToLeave,
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
                <div className={styles.headerActions}>
                    <Button onClick={openModal}>{t('boardListPage.createNewBoardButton')}</Button>
                    <Button onClick={() => navigate(APP_ROUTES.SETTINGS)} variant="secondary">
                        {t('boardListPage.setting')}
                    </Button>
                </div>
            </div>

            {boards.length > 0 ? (
                <div className={styles.boardList}>
                    {boards.map((board) => (
                        <div key={board.id} onContextMenu={(e) => contextMenu.handleContextMenu(e, board)}>
                            <BoardCard board={board} />
                        </div>
                    ))}
                </div>
            ) : (
                <p>{t('boardListPage.noBoardsMessage')}</p>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <CreateBoardForm onBoardCreated={handleBoardCreated} onClose={closeModal} />
            </Modal>

            {contextMenu.isOpen && contextMenu.data && (
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

            {boardToLeave && (
                <ConfirmationDialog
                    isOpen={isLeaveConfirmOpen}
                    onClose={() => {
                        setLeaveConfirmOpen(false);
                    }}
                    onConfirm={handleConfirmLeave}
                    title={t('leaveBoard.confirmTitle')}
                    message={t('leaveBoard.confirmText', { boardName: boardToLeave.name })}
                />
            )}
        </div>
    );
};

export default BoardListPage;
