
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


import styles from './BoardListPage.module.scss';

const BoardListPage: React.FC = () => {
  const { t } = useTranslation(['board', 'common']);
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
        content: t('board:listPage.heading'),
      },
      {
        type: 'button',
        icon: Plus,
        label: t('board:listPage.createNewBoardButton'),
        onClick: openModal,
        variant: 'cta',
      },
    ],
    centerSection: [
      {
        type: 'search',
        placeholder: t('board:toolbar.search.boardName'),
        value: searchQuery,
        onSearch: handleSearch,
        onClear: handleClearSearch,
      },
    ],
    rightSection: [
      {
        type: 'button',
        icon: Settings,
        label: t('board:listPage.setting'),
        onClick: () => navigate(APP_ROUTES.SETTINGS),
        variant: 'navigation',
        className: 'iconOnlyButton',
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
        <PageLoader message={t('board:listPage.loading')} />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <UniversalToolbar config={toolbarConfig} />
      <div className={styles.pageContent} data-has-toolbar>
{(() => {
          if (boards.length > 0) {
            return (
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
            );
          }
          
          if (searchQuery) {
            return (
              <div className={styles.emptyState}>
                <p>{t('board:listPage.noSearchResults', { query: searchQuery })}</p>
              </div>
            );
          }
          
          return (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateCard}>
                <div className={styles.emptyStateIcon}>
                  <LayoutDashboard size={48} />
                </div>
                <div className={styles.emptyStateContent}>
                  <h3 className={styles.emptyStateTitle}>
                    {t('board:listPage.emptyStateTitle')}
                  </h3>
                  <p className={styles.emptyStateMessage}>
                    {t('board:listPage.emptyStateMessage')}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

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
            {t('board:leaveBoard.button')}
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
          title={t('board:leaveBoard.confirmTitle')}
          message={t('board:leaveBoard.confirmText', { boardName: boardToLeave.name })}
        />
      )}
      </div>
    </PageTransition>
  );
};

export default BoardListPage;
