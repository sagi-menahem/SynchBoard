
import React, { useMemo } from 'react';

import type { ToolbarConfig } from 'features/board/types/ToolbarTypes';
import { LayoutDashboard, Plus, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants';
import {
  ConfirmationDialog,
  ContextMenu,
  ContextMenuItem,
  Modal,
  PageLoader,
  PageTransition,
  UniversalToolbar,
} from 'shared/ui';

import { BoardCard, CreateBoardForm } from '../components/list';
import { useBoardList } from '../hooks/management';


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
    searchQuery,
    handleSearch,
    handleClearSearch,
    viewMode,
  } = useBoardList();

  // Toolbar configuration
  const toolbarConfig: ToolbarConfig = useMemo(() => ({
    pageType: 'boards',
    leftSection: [
      {
        type: 'title',
        content: t('boardListPage.heading'),
      },
      {
        type: 'button',
        icon: Plus,
        label: t('boardListPage.createNewBoardButton'),
        onClick: openModal,
        primary: true,
      },
    ],
    centerSection: [
      {
        type: 'search',
        placeholder: t('toolbar.search.boardName'),
        value: searchQuery,
        onSearch: handleSearch,
        onClear: handleClearSearch,
      },
    ],
    rightSection: [
      {
        type: 'button',
        icon: Settings,
        label: t('boardListPage.setting'),
        onClick: () => navigate(APP_ROUTES.SETTINGS),
      },
    ],
  }), [
    t,
    openModal,
    searchQuery,
    handleSearch,
    handleClearSearch,
    navigate,
  ]);


  if (isLoading) {
    return (
      <PageTransition>
        <UniversalToolbar config={toolbarConfig} />
        <PageLoader message={t('boardListPage.loading')} />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <UniversalToolbar config={toolbarConfig} />
      <div className={styles.pageContent} data-has-toolbar>
        {boards.length > 0 ? (
          <div className={`${styles.boardList} ${styles[viewMode]}`}>
            {boards.map((board, index) => (
              <div 
                key={board.id}
                className={styles.boardListItem}
                style={{ animationDelay: `${index * 0.05}s` }}
                onContextMenu={(e) => contextMenu.handleContextMenu(e, board)}
              >
                <BoardCard board={board} viewMode={viewMode} />
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <div className={styles.emptyState}>
            <p>{t('boardListPage.noSearchResults', { query: searchQuery })}</p>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateCard}>
              <div className={styles.emptyStateIcon}>
                <LayoutDashboard size={48} />
              </div>
              <div className={styles.emptyStateContent}>
                <h3 className={styles.emptyStateTitle}>
                  {t('boardListPage.emptyStateTitle')}
                </h3>
                <p className={styles.emptyStateMessage}>
                  {t('boardListPage.emptyStateMessage')}
                </p>
              </div>
            </div>
          </div>
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
    </PageTransition>
  );
};

export default BoardListPage;
