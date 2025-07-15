// File: frontend/src/pages/BoardPage.tsx
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useBoardContext } from '../hooks/useBoardContext';
import { useBoardPage } from '../hooks/useBoardPage';
import Canvas from '../components/board/Canvas';
import Toolbar from '../components/board/Toolbar';
import ChatWindow from '../components/chat/ChatWindow';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import InviteMemberForm from '../components/board/InviteMemberForm';
import styles from './BoardPage.module.css';

const BoardPage: React.FC = () => {
    const { t } = useTranslation();
    const { boardId: boardIdString } = useParams<{ boardId: string }>();
    const boardId = parseInt(boardIdString || '0', 10);
    const pageRef = useRef<HTMLDivElement>(null);

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

    const isAdmin = boardDetails?.isAdmin || false;

    const {
        isInviteModalOpen,
        openInviteModal,
        closeInviteModal,
        handleInviteSuccess,
        tool,
        setTool,
        strokeColor,
        setStrokeColor,
        strokeWidth,
        setStrokeWidth,
    } = useBoardPage();

    if (isLoading) {
        return <div>{t('boardPage.loading')}</div>;
    }

    return (
        <div className={styles.page} ref={pageRef}>
            <div className={styles.header}>
                <h1>{boardDetails?.name || t('boardPage.loading')}</h1>
                {isAdmin && (
                    <Button onClick={openInviteModal} variant="secondary">
                        {t('boardPage.inviteButton')}
                    </Button>
                )}
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

            <Modal isOpen={isInviteModalOpen} onClose={closeInviteModal}>
                <InviteMemberForm
                    boardId={boardId}
                    onInviteSuccess={handleInviteSuccess}
                />
            </Modal>
        </div>
    );
};

export default BoardPage;