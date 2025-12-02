import defaultUserImage from 'assets/default-user-image.png';
import { isSafeUrl, sanitizeUserContent } from 'features/auth/utils/SecurityUtils';
import type { EnhancedChatMessage } from 'features/chat/types/ChatTypes';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from 'shared/constants/ApiConstants';
import { RelativeTimestamp } from 'shared/ui';
import { formatDetailedTimestamp } from 'shared/utils/DateUtils';

import styles from './ChatMessage.module.scss';

/**
 * Properties for the ChatMessage component defining message display behavior and styling.
 */
interface ChatMessageProps {
  /** Enhanced chat message object containing content, sender info, and transaction status */
  message: EnhancedChatMessage;
  /** Whether this message belongs to the current user for different styling */
  isOwnMessage?: boolean;
  /** Whether to apply slide-in animation when message appears */
  shouldAnimate?: boolean;
  /** Whether this message is part of a group from the same sender */
  isGrouped?: boolean;
}

/**
 * Individual chat message component with user differentiation, status indicators, and security features.
 * Displays chat messages with appropriate styling based on sender, includes avatar display for other users,
 * implements message grouping for consecutive messages, and provides visual feedback for message status.
 * 
 * Key features:
 * - Different styling for own messages vs. other users' messages
 * - Avatar display with secure URL validation and fallback
 * - Content sanitization to prevent XSS attacks
 * - Message grouping to reduce visual clutter for consecutive messages
 * - Status indicators for pending/failed message delivery
 * - Relative timestamps with detailed hover information
 * - Animation control for performance optimization
 * - Accessibility support with proper alt text and ARIA labels
 * 
 * @param message - Enhanced chat message with content and metadata
 * @param isOwnMessage - Boolean indicating if message belongs to current user
 * @param shouldAnimate - Whether to apply entrance animation
 * @param isGrouped - Whether message is grouped with previous message from same sender
 */
const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwnMessage = false,
  shouldAnimate = true,
  isGrouped = false,
}) => {
  const { t } = useTranslation(['chat', 'common']);
  // Build profile image URL and validate for security
  const profileUrl = message.senderProfilePictureUrl
    ? `${API_BASE_URL.replace('/api', '')}${message.senderProfilePictureUrl}`
    : defaultUserImage;

  const imageSource = isSafeUrl(profileUrl) ? profileUrl : defaultUserImage;

  // Sanitize user-generated content to prevent XSS attacks
  const senderEmail = sanitizeUserContent(message.senderEmail);
  const messageContent = sanitizeUserContent(message.content);

  // Determine message status for visual feedback
  const messageStatus = message.transactionStatus ?? 'confirmed';
  const statusClass = messageStatus !== 'confirmed' ? styles[messageStatus] : '';

  const detailedTimestamp = formatDetailedTimestamp(message.timestamp);

  // Build CSS classes based on message properties
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
      {/* Show avatar for other users' first message, invisible spacer for grouped */}
      {!isOwnMessage && !isGrouped && (
        <img
          src={imageSource}
          alt={t('common:accessibility.userAvatar', { email: senderEmail })}
          className={styles.avatar}
        />
      )}
      {/* Invisible spacer for grouped messages to maintain consistent bubble width */}
      {!isOwnMessage && isGrouped && (
        <div className={styles.avatarSpacer} aria-hidden="true" />
      )}

      <div className={styles.messageBubble}>
        {/* Show sender name only for other users' non-grouped messages */}
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

          {/* Show failure indicator for failed messages */}
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
