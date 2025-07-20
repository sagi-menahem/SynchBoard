// File: frontend/src/pages/BoardPage.tsx
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { useBoardContext } from '../hooks/useBoardContext';
import { useToolbarState } from '../hooks/useToolbarState';
import { BoardProvider } from '../context/BoardProvider';
import Canvas from '../components/board/Canvas';
import Toolbar from '../components/board/Toolbar';
import ChatWindow from '../components/chat/ChatWindow';
import Button from '../components/common/Button';
import { APP_ROUTES } from '../constants/routes.constants';
import styles from './BoardPage.module.css';

interface BoardPageContentProps {
    boardId: number;
}

const BoardPageContent: React.FC<BoardPageContentProps> = ({ boardId }) => {
    const { t } = useTranslation();
    const pageRef = useRef<HTMLDivElement>(null);

    const {
        isLoading,
        boardName,
        objects,
        messages,
        instanceId,
        handleDrawAction,
        handleUndo,
        handleRedo,
        isUndoAvailable,
        isRedoAvailable,
    } = useBoardContext();

    const {
        tool, setTool, strokeColor, setStrokeColor, strokeWidth, setStrokeWidth
    } = useToolbarState();

    if (isLoading) {
        return <div>{t('boardPage.loading')}</div>;
    }

    return (
        <div className={styles.page} ref={pageRef}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <Link to={APP_ROUTES.BOARD_LIST}>
                        <Button>
                            &larr; {t('boardPage.backButton')}
                        </Button>
                    </Link>
                    <Link to={APP_ROUTES.getBoardDetailsRoute(boardId)} className={styles.headerLink}>
                        <h1>{boardName || t('boardPage.loading')}</h1>
                    </Link>
                </div>
            </div>

            <Toolbar
                containerRef={pageRef}
                strokeColor={strokeColor} setStrokeColor={setStrokeColor}
                strokeWidth={strokeWidth} setStrokeWidth={setStrokeWidth}
                tool={tool} setTool={setTool}
                onUndo={handleUndo} isUndoAvailable={isUndoAvailable}
                onRedo={handleRedo} isRedoAvailable={isRedoAvailable}
            />

            <div className={styles.mainContent}>
                <div className={styles.canvasContainer}>
                    <Canvas
                        instanceId={instanceId}
                        onDraw={handleDrawAction}
                        objects={objects}
                        tool={tool}
                        strokeColor={strokeColor}
                        strokeWidth={strokeWidth}
                    />
                </div>
                <div className={styles.chatContainer}>
                    <ChatWindow
                        boardId={boardId}
                        messages={messages}
                    />
                </div>
            </div>
        </div>
    );
};

const BoardPage: React.FC = () => {
    const { t } = useTranslation();
    const { boardId } = useParams<{ boardId: string }>();
    const numericBoardId = parseInt(boardId || '0', 10);

    if (!numericBoardId) {
        return <div>{t('boardPage.loading')}</div>;
    }

    return (
        <BoardProvider boardId={numericBoardId}>
            <BoardPageContent boardId={numericBoardId} />
        </BoardProvider>
    );
};

export default BoardPage;