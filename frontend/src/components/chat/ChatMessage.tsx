import React from 'react';

import defaultUserImage from 'assets/default-user-image.png';
import { formatSmartTimestamp, formatDetailedTimestamp } from 'utils/DateUtils';
import { isSafeUrl, sanitizeUserContent } from 'utils/UnifiedValidation';

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

  const getMessageStatus = (): string => {
    if (!message.transactionId) return 'confirmed';
    return message.transactionStatus || 'confirmed';
  };

  const messageStatus = getMessageStatus();
  const statusClass = messageStatus !== 'confirmed' ? styles[messageStatus] : '';

  const smartTimestamp = formatSmartTimestamp(message.timestamp);
  const detailedTimestamp = formatDetailedTimestamp(message.timestamp);
  

  return (
    <div className={`${styles.messageContainer} ${isOwnMessage ? styles.myMessage : styles.otherMessage} ${statusClass}`}>
      {!isOwnMessage && (
        <img src={imageSource} alt={senderName} className={styles.avatar} />
      )}
      
      <div className={styles.messageBubble}>
        <div className={styles.messageHeader}>
          <strong className={styles.senderName}>
            {senderName}
          </strong>
        </div>
        
        <div className={styles.messageBody}>
          <div className={styles.messageText}>
            {messageContent}
          </div>
          
          <div className={styles.timestampContainer}>
            <span 
              className={styles.timestamp}
              title={detailedTimestamp}
            >
              {smartTimestamp}
            </span>
          </div>
          
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
