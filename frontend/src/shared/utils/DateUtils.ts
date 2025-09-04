import i18n from 'i18next';

/**
 * Formats a timestamp into a user-friendly, context-aware display string.
 * Uses smart logic to show relative times (e.g., "just now", "5 minutes ago") for recent dates,
 * and absolute times/dates for older content. Handles internationalization and locale formatting.
 * 
 * @param {number | Date | string} timestamp - The timestamp to format (various input types supported)
 * @returns {string} Formatted timestamp string appropriate for user display
 */
export const formatSmartTimestamp = (timestamp: number | Date | string): string => {
  let date: Date;
  if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    date = timestamp;
  }

  if (!date || isNaN(date.getTime())) {
    return i18n.t('common:dates.invalidDate');
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  // Show "just now" for very recent content
  if (diffMinutes < 1) {
    return i18n.t('common:dates.justNow');
  }

  // Show relative minutes for content within the last hour
  if (diffMinutes < 60) {
    return i18n.t('common:dates.minutesAgo', { count: diffMinutes });
  }

  // Show time only for content from today
  if (diffHours < 24 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Show "yesterday" label with time for content from previous day
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth()) {
    return `${i18n.t('common:dates.yesterday')} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  // Show month/day/time for content from current year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  // Show full date/time for content from previous years
  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formats a timestamp into a detailed, locale-aware display string.
 * Always shows the complete date and time information using the user's locale settings.
 * Used for tooltips, detailed views, or when precise timing information is needed.
 * 
 * @param {number | Date | string} timestamp - The timestamp to format (various input types supported)
 * @returns {string} Complete date and time string in user's locale format
 */
export const formatDetailedTimestamp = (timestamp: number | Date | string): string => {
  let date: Date;
  if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    date = timestamp;
  }

  if (!date || isNaN(date.getTime())) {
    return i18n.t('common:dates.invalidDate');
  }

  return date.toLocaleString();
};

/**
 * Formats a timestamp as a date separator for grouping messages or content by day.
 * Returns semantic labels like "Today", "Yesterday" for recent dates, and
 * formatted date strings for older content. Used in chat interfaces and activity feeds.
 * 
 * @param {number | Date | string} timestamp - The timestamp to format (various input types supported)
 * @returns {string} Date separator string suitable for UI grouping elements
 */
export const formatDateSeparator = (timestamp: number | Date | string): string => {
  let date: Date;
  if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    date = timestamp;
  }

  if (!date || isNaN(date.getTime())) {
    return i18n.t('common:dates.invalidDate');
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Show "Today" for current day content
  if (messageDate.getTime() === today.getTime()) {
    return i18n.t('common:dates.today');
  }

  // Show "Yesterday" for previous day content
  if (messageDate.getTime() === yesterday.getTime()) {
    return i18n.t('common:dates.yesterday');
  }

  // Show month and day for current year content
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], {
      month: 'long',
      day: 'numeric',
    });
  }
  // Show full date for content from previous years
  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
