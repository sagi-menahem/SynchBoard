import React from 'react';

import defaultUserImage from 'assets/default-user-image.png';
import { isSafeUrl, sanitizeUserContent } from 'utils/sanitize';
import { formatSmartTimestamp, formatDetailedTimestamp } from 'utils/DateUtils';

import { API_BASE_URL } from 'constants/ApiConstants';
import type { EnhancedChatMessage } from 'types/ChatTypes';

import styles from './ChatMessage.module.css';

interface ChatMessageProps {
  message: EnhancedChatMessage;
  isOwnMessage?: boolean;
  connectionStatus?: 'connected' | 'connecting' | 'disconnected';
  onRetryMessage?: (messageId: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isOwnMessage = false, 
  connectionStatus = 'connected',
  onRetryMessage 
}) => {
  const profileUrl = message.senderProfilePictureUrl
    ? `${API_BASE_URL.replace('/api', '')}${message.senderProfilePictureUrl}`
    : defaultUserImage;

  const imageSource = isSafeUrl(profileUrl) ? profileUrl : defaultUserImage;

  const senderName = sanitizeUserContent(message.senderFullName);
  const messageContent = sanitizeUserContent(message.content);

  // SIMPLE VISUAL STATUS: Use server ID as source of truth
  // Server messages have ID > 0, local optimistic messages have ID = 0 or undefined
  const isConfirmed: boolean = !!(message.id && message.id > 0);

  // Determine status for CSS class - with proper typing
  const effectiveStatus: string = isConfirmed 
    ? 'confirmed' 
    : ((message as any).transactionStatus || 'processing');

  // Apply the appropriate CSS class
  const statusClass: string = styles[effectiveStatus] || '';

  // Smart timestamp formatting
  const smartTimestamp = formatSmartTimestamp(message.timestamp);
  const detailedTimestamp = formatDetailedTimestamp(message.timestamp);
  

  return (
    <div className={`${styles.messageContainer} ${isOwnMessage ? styles.myMessage : styles.otherMessage} ${statusClass}`}>
      {/* Avatar OUTSIDE bubble for others' messages only */}
      {!isOwnMessage && (
        <img src={imageSource} alt={senderName} className={styles.avatar} />
      )}
      
      <div className={styles.messageBubble}>
        {/* Header with sender name only */}
        <div className={styles.messageHeader}>
          <strong className={styles.senderName}>
            {senderName}
          </strong>
        </div>
        
        <div className={styles.messageBody}>
          {/* Message text */}
          <div className={styles.messageText}>
            {messageContent}
          </div>
          
          {/* Timestamp in separate container for proper opposite alignment */}
          <div className={styles.timestampContainer}>
            <span 
              className={styles.timestamp}
              title={detailedTimestamp}
            >
              {smartTimestamp}
            </span>
          </div>
          
          {effectiveStatus === 'failed' && (
            <div className={styles.failureActions}>
              <span 
                className={styles.failureIcon} 
                title={
                  connectionStatus === 'connected' 
                    ? "Failed to send - click retry to try again"
                    : "Failed to send - message will be retried when connection is restored"
                }
              >
                ⚠️
              </span>
              {connectionStatus === 'connected' && onRetryMessage && (
                <button
                  className={styles.retryButton}
                  onClick={() => onRetryMessage(message.transactionId || message.id?.toString() || '')}
                  title="Retry sending message"
                  aria-label="Retry sending this failed message"
                >
                  🔄
                </button>
              )}
              {connectionStatus === 'disconnected' && (
                <span 
                  className={styles.offlineIndicator}
                  title="Will retry automatically when connection is restored"
                >
                  📴
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ChatMessage.displayName = 'ChatMessage';

export default React.memo(ChatMessage);
