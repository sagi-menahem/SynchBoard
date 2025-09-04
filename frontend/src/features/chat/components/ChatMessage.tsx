
import defaultUserImage from 'assets/default-user-image.png';
import { isSafeUrl, sanitizeUserContent } from 'features/auth/utils/SecurityUtils';
import type { EnhancedChatMessage } from 'features/chat/types/ChatTypes';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from 'shared/constants/ApiConstants';
import { RelativeTimestamp } from 'shared/ui';
import { formatDetailedTimestamp } from 'shared/utils/DateUtils';

import styles from './ChatMessage.module.scss';

interface ChatMessageProps {
  message: EnhancedChatMessage;
  isOwnMessage?: boolean;
  shouldAnimate?: boolean;
  isGrouped?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwnMessage = false,
  shouldAnimate = true,
  isGrouped = false,
}) => {
  const { t } = useTranslation(['chat', 'common']);
  const profileUrl = message.senderProfilePictureUrl
    ? `${API_BASE_URL.replace('/api', '')}${message.senderProfilePictureUrl}`
    : defaultUserImage;

  const imageSource = isSafeUrl(profileUrl) ? profileUrl : defaultUserImage;

  const senderEmail = sanitizeUserContent(message.senderEmail);
  const messageContent = sanitizeUserContent(message.content);

  const messageStatus = message.transactionStatus ?? 'confirmed';
  const statusClass = messageStatus !== 'confirmed' ? styles[messageStatus] : '';

  const detailedTimestamp = formatDetailedTimestamp(message.timestamp);

  const classNames = [
    styles.messageContainer,
    isOwnMessage ? styles.myMessage : styles.otherMessage,
    statusClass,
    !shouldAnimate && styles.noAnimation,
    isGrouped && styles.grouped,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      {!isOwnMessage && !isGrouped && (
        <img
          src={imageSource}
          alt={t('common:accessibility.userAvatar', { email: senderEmail })}
          className={styles.avatar}
        />
      )}

      <div className={styles.messageBubble}>
        {!isGrouped && !isOwnMessage && (
          <div className={styles.messageHeader}>
            <strong className={styles.senderName}>{senderEmail}</strong>
          </div>
        )}

        <div className={styles.messageBody}>
          <div className={styles.messageText}>{messageContent}</div>

          <div className={styles.timestampContainer}>
            <RelativeTimestamp
              timestamp={message.timestamp}
              className={styles.timestamp}
              title={detailedTimestamp}
            />
          </div>

          {messageStatus === 'failed' && (
            <span className={styles.failureIcon} title={t('chat:message.failedToSendTooltip')}>
              ❗
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
