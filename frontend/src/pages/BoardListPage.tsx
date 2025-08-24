import { APP_ROUTES } from 'constants';

import React, { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { BoardCard, CreateBoardForm } from 'components/board/list';
import {
  Button,
  ConfirmationDialog,
  ContextMenu,
  ContextMenuItem,
  Modal,
} from 'components/common';
import { useBoardList } from 'hooks/board/management';

import styles from './BoardListPage.module.css';

const BoardListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [, forceUpdate] = useState({});
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

  // Force re-render every 60 seconds to update timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({}); // Trigger re-render to recalculate timestamps
    }, 55000); // Update every 55 seconds (1 minute)

    return () => clearInterval(interval);
  }, []);

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
          {boards.map((board, index) => (
            <div 
              key={board.id}
              className={styles.boardListItem}
              style={{ animationDelay: `${index * 0.05}s` }}
              onContextMenu={(e) => contextMenu.handleContextMenu(e, board)}
            >
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
