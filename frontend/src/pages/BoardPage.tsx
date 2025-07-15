// File: frontend/src/pages/BoardPage.tsx
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBoardContext } from '../hooks/useBoardContext';
import { useToolbarState } from '../hooks/useToolbarState';
import Canvas from '../components/board/Canvas';
import Toolbar from '../components/board/Toolbar';
import ChatWindow from '../components/chat/ChatWindow';
import Button from '../components/common/Button';
import { APP_ROUTES } from '../constants/routes.constants';
import styles from './BoardPage.module.css';

const BoardPage: React.FC = () => {
    const { t } = useTranslation();
    const { boardId: boardIdString } = useParams<{ boardId: string }>();
    const boardId = parseInt(boardIdString || '0', 10);
    const pageRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const {
        isLoading,
        objects,
        messages,
        boardDetails,
        instanceId,
        handleDrawAction,
        handleUndo,
        handleRedo,
        isUndoAvailable,
        isRedoAvailable,
    } = useBoardContext();
    
    const {
        tool,
        setTool,
        strokeColor,
        setStrokeColor,
        strokeWidth,
        setStrokeWidth,
    } = useToolbarState();

    if (isLoading) {
        return <div>{t('boardPage.loading')}</div>;
    }

    return (
        <div className={styles.page} ref={pageRef}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    {/* Add Back Button */}
                    <Button onClick={() => navigate(APP_ROUTES.BOARD_LIST)}>
                        &larr; {t('boardPage.backButton')}
                    </Button>
                    <Link to={APP_ROUTES.getBoardDetailsRoute(boardId)} className={styles.headerLink}>
                        <h1>{boardDetails?.name || t('boardPage.loading')}</h1>
                    </Link>
                </div>
            </div>
            <Toolbar
                containerRef={pageRef}
                strokeColor={strokeColor}
                setStrokeColor={setStrokeColor}
                strokeWidth={strokeWidth}
                setStrokeWidth={setStrokeWidth}
                tool={tool}
                setTool={setTool}
                onUndo={handleUndo}
                isUndoAvailable={isUndoAvailable}
                onRedo={handleRedo}
                isRedoAvailable={isRedoAvailable}
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

export default BoardPage;