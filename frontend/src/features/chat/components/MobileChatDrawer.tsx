import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import type { ChatMessageResponse } from 'features/chat/types/MessageTypes';
import React from 'react';
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

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className={styles.overlay} />
        <Drawer.Content className={styles.content}>
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
            <ChatWindow boardId={boardId} messages={messages} />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default MobileChatDrawer;
