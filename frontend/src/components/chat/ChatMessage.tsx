import React from 'react';

import defaultUserImage from 'assets/default-user-image.png';
import { getUserColor, isSafeUrl, sanitizeUserContent, type UserColorMap } from 'utils';
import { formatDetailedTimestamp, formatSmartTimestamp } from 'utils/DateUtils';

import { API_BASE_URL } from 'constants/ApiConstants';
import type { EnhancedChatMessage } from 'types/ChatTypes';
import { RelativeTimestamp } from 'components/common';

import styles from './ChatMessage.module.css';

interface ChatMessageProps {
  message: EnhancedChatMessage;
  isOwnMessage?: boolean;
  userColorMap: UserColorMap;
  shouldAnimate?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwnMessage = false, userColorMap, shouldAnimate = true }) => {
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

  const detailedTimestamp = formatDetailedTimestamp(message.timestamp);
  

  return (
    <div className={`${styles.messageContainer} ${isOwnMessage ? styles.myMessage : styles.otherMessage} ${statusClass} ${!shouldAnimate ? styles.noAnimation : ''}`}>
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
            <RelativeTimestamp
              timestamp={message.timestamp}
              className={styles.timestamp}
              title={detailedTimestamp}
            />
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

export default ChatMessage;
