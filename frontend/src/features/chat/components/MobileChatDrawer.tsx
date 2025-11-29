import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import type { ChatMessageResponse } from 'features/chat/types/MessageTypes';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Drawer } from 'vaul';

import ChatWindow, { type ChatWindowHandle } from './ChatWindow';
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
 * Handles mobile keyboard by tracking visual viewport height and adjusting
 * the drawer content area accordingly.
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
  const contentRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<ChatWindowHandle>(null);
  const previousMessageCount = useRef<number>(messages.length);

  // Handle scrolling when new messages arrive on mobile
  // Uses requestAnimationFrame to ensure DOM has updated before scrolling
  // This avoids the race condition with keyboard/viewport that causes gaps
  useEffect(() => {
    if (!isOpen) return;

    const messageCount = messages.length;
    if (messageCount > previousMessageCount.current) {
      // New message arrived - scroll to bottom using rAF to ensure DOM is ready
      // This is safer than setTimeout as it syncs with the browser's render cycle
      requestAnimationFrame(() => {
        chatWindowRef.current?.scrollToBottom();
      });
    }
    previousMessageCount.current = messageCount;
  }, [messages.length, isOpen]);

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={onOpenChange}
      // Prevent background scaling which can cause visual glitches on mobile
      shouldScaleBackground={false}
      // Allow dismissing by swiping down
      dismissible
    >
      <Drawer.Portal>
        <Drawer.Overlay className={styles.overlay} />
        <Drawer.Content
          ref={contentRef}
          className={styles.content}
        >
          {/* Vaul's built-in handle component for proper drag behavior */}
          <Drawer.Handle className={styles.handle} />
          <Drawer.Title className={styles.title}>{t('chat:window.title')}</Drawer.Title>
          <VisuallyHidden.Root asChild>
            <Drawer.Description>
              {t('chat:window.description')}
            </Drawer.Description>
          </VisuallyHidden.Root>
          <div className={styles.chatContainer}>
            <ChatWindow boardId={boardId} messages={messages} isMobileDrawer chatRef={chatWindowRef} />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default MobileChatDrawer;
