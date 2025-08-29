import React from 'react';

import defaultUserImage from 'assets/default-user-image.png';
import { isSafeUrl, sanitizeUserContent } from 'features/auth/utils/SecurityUtils';
import type { EnhancedChatMessage } from 'features/chat/types/ChatTypes';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from 'shared/constants/ApiConstants';
import { RelativeTimestamp } from 'shared/ui';
import { getUserColor, type UserColorMap } from 'shared/utils';
import { formatDetailedTimestamp } from 'shared/utils/DateUtils';


import styles from './ChatMessage.module.scss';

interface ChatMessageProps {
  message: EnhancedChatMessage;
  isOwnMessage?: boolean;
  userColorMap: UserColorMap;
  shouldAnimate?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isOwnMessage = false, 
  userColorMap, 
  shouldAnimate = true, 
}) => {
  const { t } = useTranslation(['chat', 'common']);
  const profileUrl = message.senderProfilePictureUrl
    ? `${API_BASE_URL.replace('/api', '')}${message.senderProfilePictureUrl}`
    : defaultUserImage;

  const imageSource = isSafeUrl(profileUrl) ? profileUrl : defaultUserImage;

  const senderEmail = sanitizeUserContent(message.senderEmail);
  const messageContent = sanitizeUserContent(message.content);
  
  const userColor = getUserColor(senderEmail, userColorMap);

  const getMessageStatus = (): string => {
    if (!message.transactionId) {return 'confirmed';}
    return message.transactionStatus ?? 'confirmed';
  };

  const messageStatus = getMessageStatus();
  const statusClass = messageStatus !== 'confirmed' ? styles[messageStatus] : '';

  const detailedTimestamp = formatDetailedTimestamp(message.timestamp);
  

  return (
    <div className={`${styles.messageContainer} ${isOwnMessage ? styles.myMessage : styles.otherMessage} ${statusClass} ${!shouldAnimate ? styles.noAnimation : ''}`}>
      {!isOwnMessage && (
        <img src={imageSource} alt={t('common:accessibility.userAvatar', { email: senderEmail })} className={styles.avatar} />
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
              title={t('chat:message.failedToSendTooltip')}
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
