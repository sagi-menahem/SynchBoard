import React from 'react';

import defaultUserImage from 'assets/default-user-image.png';
import { isSafeUrl, sanitizeUserContent } from 'utils/Sanitize';
import { formatSmartTimestamp, formatDetailedTimestamp } from 'utils/DateUtils';

import { API_BASE_URL } from 'constants/ApiConstants';
import type { EnhancedChatMessage } from 'types/ChatTypes';

import styles from './ChatMessage.module.css';

interface ChatMessageProps {
  message: EnhancedChatMessage;
  isOwnMessage?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwnMessage = false }) => {
  const profileUrl = message.senderProfilePictureUrl
    ? `${API_BASE_URL.replace('/api', '')}${message.senderProfilePictureUrl}`
    : defaultUserImage;

  const imageSource = isSafeUrl(profileUrl) ? profileUrl : defaultUserImage;

  const senderName = sanitizeUserContent(message.senderFullName);
  const messageContent = sanitizeUserContent(message.content);

  // Determine message status for styling
  const getMessageStatus = (): string => {
    if (!message.transactionId) return 'confirmed'; // Server-originated message
    return message.transactionStatus || 'confirmed';
  };

  const messageStatus = getMessageStatus();
  const statusClass = messageStatus !== 'confirmed' ? styles[messageStatus] : '';

  // Smart timestamp formatting
  const smartTimestamp = formatSmartTimestamp(message.timestamp);
  const detailedTimestamp = formatDetailedTimestamp(message.timestamp);

  return (
    <div className={`${styles.messageContainer} ${isOwnMessage ? styles.ownMessage : ''} ${statusClass}`}>
      {!isOwnMessage && (
        <img src={imageSource} alt={senderName} className={styles.avatar} />
      )}
      <div className={styles.messageContent}>
        {!isOwnMessage && (
          <div className={styles.messageHeader}>
            <strong 
              className={styles.senderName}
              style={{ color: '#ffffff' }} // Backup inline style
            >
              {senderName}
            </strong>
            <span 
              className={styles.timestamp} 
              title={detailedTimestamp}
              style={{ color: '#a0a0a0' }} // Backup inline style
            >
              {smartTimestamp}
            </span>
          </div>
        )}
        <div className={styles.messageBody}>
          <span 
            className={styles.messageText}
            style={{ color: '#e0e0e0' }} // Backup inline style for message text
          >
            {messageContent}
          </span>
          {isOwnMessage && (
            <span 
              className={styles.ownTimestamp} 
              title={detailedTimestamp}
              style={{ color: '#a0a0a0' }} // Backup inline style
            >
              {smartTimestamp}
            </span>
          )}
          {messageStatus === 'failed' && (
            <span 
              className={styles.failureIcon} 
              title="Failed to send - message will be retried when connection is restored"
            >
              ❗
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

ChatMessage.displayName = 'ChatMessage';

export default React.memo(ChatMessage);
