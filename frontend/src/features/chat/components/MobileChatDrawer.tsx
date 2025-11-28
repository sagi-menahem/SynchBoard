import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import type { ChatMessageResponse } from 'features/chat/types/MessageTypes';
import React, { useEffect, useRef, useState } from 'react';
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
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const initialViewportHeight = useRef<number | null>(null);

  // Track visual viewport to handle keyboard appearance
  // This adjusts the drawer height when the keyboard opens/closes
  useEffect(() => {
    if (!isOpen) {
      setViewportHeight(null);
      setIsKeyboardOpen(false);
      initialViewportHeight.current = null;
      return;
    }

    const viewport = window.visualViewport;
    if (!viewport) return;

    const updateHeight = () => {
      const newHeight = viewport.height;

      // Store the initial viewport height (before keyboard opens)
      if (initialViewportHeight.current === null) {
        initialViewportHeight.current = newHeight;
      }

      // Detect keyboard state by comparing to initial height
      // Keyboard is open if viewport is significantly smaller than initial (>150px accounts for browser UI)
      const keyboardNowOpen = initialViewportHeight.current - newHeight > 150;

      // Keyboard just opened - scroll messages to bottom
      if (keyboardNowOpen && !isKeyboardOpen) {
        setTimeout(() => {
          chatWindowRef.current?.scrollToBottom();
        }, 50);
      }

      setIsKeyboardOpen(keyboardNowOpen);
      setViewportHeight(newHeight);
    };

    // Initial measurement
    updateHeight();

    viewport.addEventListener('resize', updateHeight);
    viewport.addEventListener('scroll', updateHeight);

    return () => {
      viewport.removeEventListener('resize', updateHeight);
      viewport.removeEventListener('scroll', updateHeight);
    };
  }, [isOpen, isKeyboardOpen]);

  // Calculate the drawer height based on visual viewport and keyboard state
  // When keyboard is OPEN: use almost full viewport height (minus small top margin)
  // When keyboard is CLOSED: use 85% of viewport for a nice bottom sheet look
  const contentStyle = viewportHeight
    ? {
        height: isKeyboardOpen
          ? `${viewportHeight - 20}px` // Keyboard open: fill viewport minus small top gap
          : `${viewportHeight * 0.85}px`, // Keyboard closed: 85% for bottom sheet look
      }
    : undefined;

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
          style={contentStyle}
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
