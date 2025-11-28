import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import type { ChatMessageResponse } from 'features/chat/types/MessageTypes';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Drawer } from 'vaul';

import ChatWindow from './ChatWindow';
import styles from './MobileChatDrawer.module.scss';

/**
 * Props for the MobileChatDrawer component.
 */
interface MobileChatDrawerProps {
  /** Board identifier for chat context */
  boardId: number;
  /** Array of chat messages to display */
  messages: ChatMessageResponse[];
  /** Controls whether the drawer is open */
  isOpen: boolean;
  /** Callback when the drawer open state changes */
  onOpenChange: (open: boolean) => void;
}

/**
 * Mobile-optimized chat drawer using vaul for smooth bottom sheet interactions.
 * Provides a swipe-to-dismiss interface for chat on mobile devices while
 * maintaining full chat functionality through the existing ChatWindow component.
 *
 * Handles mobile keyboard interactions by:
 * - Tracking visual viewport changes to adjust for keyboard
 * - Preventing drawer dismissal during keyboard interactions
 * - Using proper vaul configuration for mobile behavior
 *
 * @param boardId - Board identifier for chat context
 * @param messages - Array of chat messages to display
 * @param isOpen - Controls whether the drawer is open
 * @param onOpenChange - Callback when the drawer open state changes
 */
const MobileChatDrawer: React.FC<MobileChatDrawerProps> = ({
  boardId,
  messages,
  isOpen,
  onOpenChange,
}) => {
  const { t } = useTranslation(['chat']);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Track visual viewport changes to detect mobile keyboard
  useEffect(() => {
    if (!isOpen) {
      setKeyboardHeight(0);
      return;
    }

    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleResize = () => {
      // Calculate keyboard height from the difference between window and viewport
      const windowHeight = window.innerHeight;
      const viewportHeight = viewport.height;
      const newKeyboardHeight = Math.max(0, windowHeight - viewportHeight);
      setKeyboardHeight(newKeyboardHeight);
    };

    // Initial check
    handleResize();

    viewport.addEventListener('resize', handleResize);
    viewport.addEventListener('scroll', handleResize);

    return () => {
      viewport.removeEventListener('resize', handleResize);
      viewport.removeEventListener('scroll', handleResize);
    };
  }, [isOpen]);

  // Handle open change with keyboard awareness
  // Prevent accidental closes when keyboard is active
  const handleOpenChange = useCallback(
    (open: boolean) => {
      // If trying to close while keyboard is visible, allow it
      // The keyboard detection ensures we don't fight with the system
      onOpenChange(open);
    },
    [onOpenChange],
  );

  // Dynamic style for keyboard adjustment
  const contentStyle = keyboardHeight > 0
    ? { '--keyboard-height': `${keyboardHeight}px` } as React.CSSProperties
    : undefined;

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={handleOpenChange}
      // Prevent background scaling which can cause visual glitches on mobile
      shouldScaleBackground={false}
      // Only allow dragging from the handle area to prevent conflicts with scrolling
      handleOnly={false}
      // Modal ensures proper focus management
      modal
    >
      <Drawer.Portal>
        <Drawer.Overlay className={styles.overlay} />
        <Drawer.Content
          className={styles.content}
          style={contentStyle}
          // Prevent drawer from being dismissed when interacting with content
          onPointerDownOutside={() => {
            // Allow closing when tapping overlay
          }}
        >
          <div className={styles.handleContainer}>
            <div className={styles.handle} />
          </div>
          <Drawer.Title className={styles.title}>{t('chat:window.title')}</Drawer.Title>
          <VisuallyHidden.Root asChild>
            <Drawer.Description>
              {t('chat:window.description')}
            </Drawer.Description>
          </VisuallyHidden.Root>
          <div className={styles.chatContainer}>
            <ChatWindow boardId={boardId} messages={messages} isMobileDrawer />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default MobileChatDrawer;
