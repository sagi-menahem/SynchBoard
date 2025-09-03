import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useConnectionStatus } from 'features/websocket/hooks/useConnectionStatus';
import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from 'shared/ui/components/forms/Button';

import styles from './ChatInput.module.scss';

interface ChatInputProps {
    onSendMessage: (content: string) => Promise<void>;
    disabled?: boolean;
    placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = React.memo(({ 
  onSendMessage, 
  placeholder, 
}) => {
  const { t } = useTranslation(['chat', 'common']);
  const { shouldBlockFunctionality } = useConnectionStatus();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
        
    const messageContent = message.trim();
    if (!messageContent || shouldBlockFunctionality || isSending) {
      return;
    }

    setIsSending(true);
        
    try {
      await onSendMessage(messageContent);
      setMessage('');
    } catch {
      setMessage('');
    } finally {
      setIsSending(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [message, onSendMessage, shouldBlockFunctionality, isSending]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  }, []);

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

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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