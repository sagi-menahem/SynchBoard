import React from 'react';

import styles from './BoardWorkspaceSkeleton.module.scss';
import Skeleton from './Skeleton';

/**
 * Message skeleton data for chat panel
 */
interface MessageSkeletonData {
  type: 'sent' | 'received';
  width: string;
}

const SKELETON_MESSAGES: MessageSkeletonData[] = [
  { type: 'received', width: '70%' },
  { type: 'received', width: '50%' },
  { type: 'sent', width: '60%' },
  { type: 'received', width: '80%' },
  { type: 'sent', width: '45%' },
  { type: 'sent', width: '65%' },
];

/**
 * Skeleton placeholder for the Board workspace during loading states.
 * Matches the actual board workspace layout with:
 * - Canvas panel (70%) on the left with dark background
 * - Resize handle in the middle
 * - Chat panel (30%) on the right with message skeletons
 * - Floating toolbar at the bottom
 */
const BoardWorkspaceSkeleton: React.FC = () => {
  return (
    <div className={styles.workspaceSkeleton}>
      {/* Canvas Panel - Left side */}
      <div className={styles.canvasPanel}>
        <div className={styles.canvasArea}>
          {/* Canvas placeholder - represents the drawing area */}
          <div className={styles.canvasPlaceholder} />
        </div>
      </div>

      {/* Resize Handle - Between panels */}
      <div className={styles.resizeHandle}>
        <div className={styles.resizeHandleInner}>
          <div className={styles.handleDot} />
          <div className={styles.handleDot} />
          <div className={styles.handleDot} />
        </div>
      </div>

      {/* Chat Panel - Right side */}
      <div className={styles.chatPanel}>
        <div className={`${styles.chatMessages} ${styles.lightSkeleton}`}>
          {SKELETON_MESSAGES.map((msg, index) => (
            <div
              key={index}
              className={`${styles.messageSkeleton} ${styles[msg.type]}`}
            >
              {msg.type === 'received' && (
                <div className={styles.messageHeader}>
                  <Skeleton variant="circular" className={styles.messageAvatar} />
                  <Skeleton variant="text" className={styles.messageSender} />
                </div>
              )}
              <div className={styles.messageBubble}>
                <Skeleton variant="text" className={styles.messageText} width={msg.width} />
              </div>
              <Skeleton variant="text" className={styles.messageTime} />
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className={styles.chatInput}>
          <Skeleton variant="rounded" className={styles.inputField} />
          <Skeleton variant="circular" className={styles.sendButton} />
        </div>
      </div>

      {/* Floating Toolbar */}
      <div className={styles.toolbarSkeleton}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="circular" className={styles.toolButton} />
        ))}
      </div>
    </div>
  );
};

export default BoardWorkspaceSkeleton;
