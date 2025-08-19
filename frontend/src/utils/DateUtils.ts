/**
 * Smart timestamp formatting utility for chat messages
 * Formats timestamps based on recency for optimal user experience
 */

/**
 * Format a timestamp for display in chat messages
 * @param timestamp - The timestamp to format (Date object, number, or ISO string)
 * @returns Formatted string representing the time
 */
export const formatSmartTimestamp = (timestamp: number | Date | string): string => {
  // Convert string/number to Date if needed
  let date: Date;
  if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    date = timestamp;
  }
  
  // Validate the date
  if (!date || isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  // const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)); // unused

  // Less than 1 minute ago
  if (diffMinutes < 1) {
    return 'Just now';
  }

  // Less than 1 hour ago
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  // Less than 24 hours ago (same day)
  if (diffHours < 24 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth()) {
    return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  // Within this year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // Different year
  return date.toLocaleDateString([], { 
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

/**
 * Get a more detailed timestamp for hover tooltips
 * @param timestamp - The timestamp to format (Date object, number, or ISO string)
 * @returns Full formatted date and time string
 */
export const formatDetailedTimestamp = (timestamp: number | Date | string): string => {
  // Convert string/number to Date if needed
  let date: Date;
  if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    date = timestamp;
  }
  
  // Validate the date
  if (!date || isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  return date.toLocaleString();
};

/**
 * Format a date for use in chat date separators
 * @param timestamp - The timestamp to format (Date object, number, or ISO string)
 * @returns Formatted date string for separators
 */
export const formatDateSeparator = (timestamp: number | Date | string): string => {
  // Convert string/number to Date if needed
  let date: Date;
  if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    date = timestamp;
  }
  
  // Validate the date
  if (!date || isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if it's today
  if (messageDate.getTime() === today.getTime()) {
    return 'Today';
  }
  
  // Check if it's yesterday
  if (messageDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }
  
  // Check if it's within this year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  // Different year - include year
  return date.toLocaleDateString([], { 
    year: 'numeric',
    month: 'long', 
    day: 'numeric' 
  });
};