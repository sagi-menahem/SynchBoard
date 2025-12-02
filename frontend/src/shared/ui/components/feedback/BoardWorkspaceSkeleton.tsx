import React, { useMemo } from 'react';
import { useIsMobile } from 'shared/hooks';
import utilStyles from 'shared/ui/styles/utils.module.scss';

import styles from './BoardWorkspaceSkeleton.module.scss';
import Skeleton from './Skeleton';

/**
 * Props for BoardWorkspaceSkeleton component.
 */
interface BoardWorkspaceSkeletonProps {
  /** Canvas to chat split ratio (percentage for canvas). Default: 70 */
  splitRatio?: number;
  /** Container style for background CSS variables */
  containerStyle?: React.CSSProperties;
}

/**
 * Skeleton placeholder for the Board workspace during loading states.
 * Matches the actual board workspace layout with:
 * - Canvas panel (empty, showing SVG pattern background)
 * - Resize handle in the middle
 * - Chat panel with input skeleton
 *
 * @param splitRatio - Canvas panel width percentage (default: 70)
 * @param containerStyle - CSS variables for background sizing
 */
const BoardWorkspaceSkeleton: React.FC<BoardWorkspaceSkeletonProps> = ({
  splitRatio = 70,
  containerStyle,
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

  return (
    <div
      className={`${styles.workspaceSkeleton} ${utilStyles.unifiedDotBackground}`}
      style={containerStyle}
    >
      {/* Canvas Panel - Empty, just shows the SVG pattern background */}
      <div className={styles.canvasPanel} style={panelStyles.canvas}>
        <div className={styles.canvasArea} />
      </div>

      {/* Resize Handle - Between panels */}
      <div className={styles.resizeHandle}>
        <div className={styles.resizeHandleInner}>
          <div className={styles.handleDot} />
          <div className={styles.handleDot} />
          <div className={styles.handleDot} />
        </div>
      </div>

      {/* Chat Panel - Just the input area, no message bubbles */}
      <div className={styles.chatPanel} style={panelStyles.chat}>
        <div className={styles.chatMessages} />

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
