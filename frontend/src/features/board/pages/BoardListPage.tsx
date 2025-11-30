import { LayoutDashboard, LogOut, Plus, Settings } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants';
import {
    AppHeader,
    Button,
    Card,
    ConfirmationDialog,
    ContextMenuItem,
    EnhancedContextMenu,
    Modal,
    PageLoader,
    PageTransition,
    SearchBar,
} from 'shared/ui';

import { BoardCard, CreateBoardForm } from '../components/list';
import { useBoardList } from '../hooks/management';

import styles from './BoardListPage.module.scss';

/**
 * Board List Page component that displays and manages the user's board collection.
 * This page serves as the main dashboard for board overview, providing board search functionality,
 * creation capabilities, and board management operations. It handles different display states including
 * loading, empty states, search results, and populated board lists with staggered animations.
 * The component integrates context menus for board operations and modal dialogs for board creation
 * and confirmation workflows. Uses AppHeader for navigation and search functionality.
 */
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

  if (isLoading) {
    return (
      <PageTransition>
        <AppHeader
          leading={(
            <div className={styles.titleWithButton}>
              <h1 className={styles.pageTitle}>{t('board:listPage.heading')}</h1>
              <Button variant="cta" onClick={openModal}>
                <Plus size={20} />
                <span className={styles.createButtonLabel}>{t('board:listPage.createNewBoardButton')}</span>
              </Button>
            </div>
          )}
          center={(
            <SearchBar
              placeholder={t('board:toolbar.search.boardName')}
              value={searchQuery}
              onSearch={handleSearch}
              onClear={handleClearSearch}
            />
          )}
          showCenterOnMobile={true}
          trailing={(
            <Button variant="icon" onClick={() => navigate(APP_ROUTES.SETTINGS)} title={t('board:listPage.setting')}>
              <Settings size={20} />
            </Button>
          )}
        />
        <PageLoader message={t('board:listPage.loading')} />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <AppHeader
        leading={(
          <div className={styles.titleWithButton}>
            <h1 className={styles.pageTitle}>{t('board:listPage.heading')}</h1>
            <Button variant="cta" onClick={openModal}>
              <Plus size={20} />
              <span className={styles.createButtonLabel}>{t('board:listPage.createNewBoardButton')}</span>
            </Button>
          </div>
        )}
        center={(
          <SearchBar
            placeholder={t('board:toolbar.search.boardName')}
            value={searchQuery}
            onSearch={handleSearch}
            onClear={handleClearSearch}
          />
        )}
        showCenterOnMobile={true}
        trailing={(
          <Button variant="icon" onClick={() => navigate(APP_ROUTES.SETTINGS)} title={t('board:listPage.setting')}>
            <Settings size={20} />
          </Button>
        )}
      />
      <main className={styles.pageContent}>
        {(() => {
          // Render board grid with staggered animation when boards are available
          if (boards.length > 0) {
            return (
              <ul className={`${styles.boardList} ${styles[viewMode]}`}>
                {boards.map((board, index) => (
                  <li
                    key={board.id}
                    className={styles.boardListItem}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onContextMenu={(e) => contextMenu.handleContextMenu(e, board)}
                  >
                    <BoardCard board={board} viewMode={viewMode} />
                  </li>
                ))}
              </ul>
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
              <Card
                variant="empty-state"
                hoverable
                className={styles.emptyStateCard}
                onClick={openModal}
              >
                <div className={styles.emptyStateIcon}>
                  <LayoutDashboard size={48} />
                </div>
                <div className={styles.emptyStateContent}>
                  <h3 className={styles.emptyStateTitle}>{t('board:listPage.emptyStateTitle')}</h3>
                  <p className={styles.emptyStateMessage}>
                    {t('board:listPage.emptyStateMessage')}
                  </p>
                </div>
              </Card>
            </div>
          );
        })()}

        <Modal isOpen={isModalOpen} onClose={closeModal} className="modal-wide">
          <CreateBoardForm onBoardCreated={handleBoardCreated} onClose={closeModal} />
        </Modal>
      </main>

      {contextMenu.isOpen && contextMenu.data && (
        <EnhancedContextMenu
          x={contextMenu.anchorPoint.x}
          y={contextMenu.anchorPoint.y}
          onClose={contextMenu.closeMenu}
        >
          <ContextMenuItem
            onClick={handleLeaveClick}
            variant="destructive"
            icon={<LogOut size={16} />}
          >
            {t('board:leaveBoard.button')}
          </ContextMenuItem>
        </EnhancedContextMenu>
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
    </PageTransition>
  );
};

export default BoardListPage;
