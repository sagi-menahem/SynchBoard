import React from 'react';

import defaultUserImage from 'assets/default-user-image.png';
import { getUserColor, isSafeUrl, sanitizeUserContent, type UserColorMap } from 'utils';
import { formatDetailedTimestamp, formatSmartTimestamp } from 'utils/DateUtils';

import { API_BASE_URL } from 'constants/ApiConstants';
import type { EnhancedChatMessage } from 'types/ChatTypes';

import styles from './ChatMessage.module.css';

interface ChatMessageProps {
  message: EnhancedChatMessage;
  isOwnMessage?: boolean;
  userColorMap: UserColorMap;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwnMessage = false, userColorMap }) => {
  const profileUrl = message.senderProfilePictureUrl
    ? `${API_BASE_URL.replace('/api', '')}${message.senderProfilePictureUrl}`
    : defaultUserImage;

  const imageSource = isSafeUrl(profileUrl) ? profileUrl : defaultUserImage;

  const senderEmail = sanitizeUserContent(message.senderEmail);
  const messageContent = sanitizeUserContent(message.content);
  
  const userColor = getUserColor(senderEmail, userColorMap);

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
        <img src={imageSource} alt={senderEmail} className={styles.avatar} />
      )}
      
      <div className={styles.messageBubble}>
        <div className={styles.messageHeader}>
          <strong className={styles.senderName} style={{ color: userColor }}>
            {senderEmail}
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
