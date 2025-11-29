import { useConnectionStatus } from 'features/websocket/hooks/useConnectionStatus';
import { Send } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from 'shared/ui/components/forms/Button';

import styles from './ChatInput.module.scss';

/**
 * Properties for the ChatInput component defining message input behavior and customization.
 */
interface ChatInputProps {
  /** Callback function to handle message sending with async processing */
  onSendMessage: (content: string) => Promise<void>;
  /** Optional flag to disable the input (currently unused in favor of connection-based disabling) */
  disabled?: boolean;
  /** Optional custom placeholder text for the input field */
  placeholder?: string;
  /** Disable auto-focus on mount (useful for mobile drawers where keyboard should not open immediately) */
  disableAutoFocus?: boolean;
}

/**
 * Chat message input component with real-time messaging capabilities and connection awareness.
 * Provides a user-friendly interface for composing and sending chat messages with automatic
 * focus management, keyboard shortcuts, and connection status integration.
 * 
 * Key features:
 * - Enter key submission with form validation
 * - Real-time connection status awareness for functionality blocking
 * - Automatic input focus management after message sending
 * - Loading states during message transmission
 * - Accessibility support with proper ARIA labels
 * - Message validation to prevent empty submissions
 * - Visual feedback for sending states
 * 
 * @param onSendMessage - Async callback to handle message transmission
 * @param placeholder - Optional custom placeholder text for input field
 */
const ChatInput: React.FC<ChatInputProps> = React.memo(({ onSendMessage, placeholder, disableAutoFocus = false }) => {
  const { t } = useTranslation(['chat', 'common']);
  const { shouldBlockFunctionality } = useConnectionStatus();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  // Ref for programmatic focus management after message sending
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const messageContent = message.trim();
      // Prevent submission of empty messages or when connection issues exist
      if (!messageContent || shouldBlockFunctionality || isSending) {
        return;
      }

      setIsSending(true);

      try {
        await onSendMessage(messageContent);
        setMessage('');
      } catch {
        // Clear message even on error to prevent resubmission
        setMessage('');
      } finally {
        setIsSending(false);
        // Always refocus to keep keyboard open after sending
        // The key is to refocus synchronously before the browser can close the keyboard
        // Using a microtask (queueMicrotask) is faster than setTimeout/requestAnimationFrame
        queueMicrotask(() => {
          inputRef.current?.focus({ preventScroll: true });
        });
      }
    },
    [message, onSendMessage, shouldBlockFunctionality, isSending],
  );

  // Memoized to prevent unnecessary re-renders when parent components update
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  }, []);

  // Handle Enter key to submit message (standard chat behavior)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    }
  }, []);

  // Focus input on component mount for immediate typing (disabled for mobile drawers)
  useEffect(() => {
    if (!disableAutoFocus) {
      inputRef.current?.focus();
    }
  }, [disableAutoFocus]);

  const hasMessage = message.trim().length > 0;
  const isDisabled = shouldBlockFunctionality || isSending;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={`${styles.inputContainer} ${isSending ? styles.sending : ''}`}>
        <input
          id="chat-message-input"
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? t('chat:window.placeholder')}
          disabled={isDisabled}
          className={styles.input}
          aria-label={t('chat:window.placeholder')}
        />
        <Button
          type="submit"
          variant="icon"
          disabled={!hasMessage || isDisabled}
          className={styles.sendButton}
          aria-label={isSending ? t('chat:sending') : t('common:button.send')}
        >
          <Send size={18} />
        </Button>
      </div>
    </form>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;
