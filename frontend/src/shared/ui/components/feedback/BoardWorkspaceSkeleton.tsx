import React, { useMemo } from 'react';
import { useIsMobile } from 'shared/hooks';
import utilStyles from 'shared/ui/styles/utils.module.scss';

import styles from './BoardWorkspaceSkeleton.module.scss';
import Skeleton from './Skeleton';

// Default canvas dimensions (same as BoardConstants)
const DEFAULT_CANVAS_WIDTH = 1200;
const DEFAULT_CANVAS_HEIGHT = 800;

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
 * Props for BoardWorkspaceSkeleton component.
 */
interface BoardWorkspaceSkeletonProps {
  /** Canvas to chat split ratio (percentage for canvas). Default: 70 */
  splitRatio?: number;
  /** Container style for background CSS variables */
  containerStyle?: React.CSSProperties;
  /** Canvas zoom scale. Default: 1.0 */
  zoomScale?: number;
  /** Canvas width in pixels. Default: 1200 */
  canvasWidth?: number;
  /** Canvas height in pixels. Default: 800 */
  canvasHeight?: number;
}

/**
 * Skeleton placeholder for the Board workspace during loading states.
 * Matches the actual board workspace layout with:
 * - Canvas panel with dark background
 * - Resize handle in the middle
 * - Chat panel with message skeletons
 * - Floating toolbar at the bottom
 *
 * @param splitRatio - Canvas panel width percentage (default: 70)
 * @param containerStyle - CSS variables for background sizing
 * @param zoomScale - Canvas zoom level (default: 1.0)
 * @param canvasWidth - Canvas width in pixels (default: 1200)
 * @param canvasHeight - Canvas height in pixels (default: 800)
 */
const BoardWorkspaceSkeleton: React.FC<BoardWorkspaceSkeletonProps> = ({
  splitRatio = 70,
  containerStyle,
  zoomScale = 1.0,
  canvasWidth = DEFAULT_CANVAS_WIDTH,
  canvasHeight = DEFAULT_CANVAS_HEIGHT,
}) => {
  const isMobile = useIsMobile();

  // Calculate panel sizes based on split ratio
  const panelStyles = useMemo(
    () => ({
      canvas: { flex: `0 0 ${splitRatio}%` },
      chat: { flex: `0 0 ${100 - splitRatio}%` },
    }),
    [splitRatio],
  );

  // Calculate the scaled canvas size
  const scaledCanvasStyle = useMemo(
    () => ({
      width: `${canvasWidth * zoomScale}px`,
      height: `${canvasHeight * zoomScale}px`,
    }),
    [canvasWidth, canvasHeight, zoomScale],
  );

  return (
    <div
      className={`${styles.workspaceSkeleton} ${utilStyles.unifiedDotBackground}`}
      style={containerStyle}
    >
      {/* Canvas Panel */}
      <div className={styles.canvasPanel} style={panelStyles.canvas}>
        <div className={styles.canvasArea}>
          {/* Canvas rectangle - centered and scaled */}
          <div className={styles.canvasRectangle} style={scaledCanvasStyle} />
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

      {/* Chat Panel */}
      <div className={styles.chatPanel} style={panelStyles.chat}>
        <div className={`${styles.chatMessages} ${styles.lightSkeleton}`}>
          {SKELETON_MESSAGES.map((msg, index) => (
            <div key={index} className={`${styles.messageSkeleton} ${styles[msg.type]}`}>
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

      {/* Mobile Toolbar Tab - Only visible on mobile */}
      {isMobile && (
        <div className={styles.mobileToolbarTab}>
          <Skeleton variant="text" width={16} height={16} />
          <Skeleton variant="circular" width={20} height={20} />
        </div>
      )}
    </div>
  );
};

export default BoardWorkspaceSkeleton;
