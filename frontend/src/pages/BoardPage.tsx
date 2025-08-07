import React, { useRef } from 'react';

import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import BoardHeader from 'components/board/workspace/BoardHeader';
import BoardWorkspace from 'components/board/workspace/BoardWorkspace';
import Toolbar from 'components/board/workspace/Toolbar';
import { BoardProvider } from 'context/BoardProvider';
import { useBoardContext } from 'hooks/board/context/useBoardContext';
import { useToolbarState } from 'hooks/board/workspace/useToolbarState';

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

    const { tool, setTool, strokeColor, setStrokeColor, strokeWidth, setStrokeWidth } = useToolbarState();

    if (isLoading) {
        return <div>{t('boardPage.loading')}</div>;
    }

    return (
        <div className={styles.page} ref={pageRef}>
            <BoardHeader boardId={boardId} boardName={boardName} />

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

            <BoardWorkspace
                boardId={boardId}
                instanceId={instanceId}
                objects={objects}
                messages={messages}
                tool={tool}
                strokeColor={strokeColor}
                strokeWidth={strokeWidth}
                onDraw={handleDrawAction}
            />
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
