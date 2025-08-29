import i18n from 'i18next';

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

  if (diffMinutes < 1) {
    return i18n.t('common:dates.justNow');
  }

  if (diffMinutes < 60) {
    return i18n.t('common:dates.minutesAgo', { count: diffMinutes });
  }

  if (diffHours < 24 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth()) {
    return `${i18n.t('common:dates.yesterday')} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

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

  if (messageDate.getTime() === today.getTime()) {
    return i18n.t('common:dates.today');
  }

  if (messageDate.getTime() === yesterday.getTime()) {
    return i18n.t('common:dates.yesterday');
  }

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], {
      month: 'long',
      day: 'numeric',
    });
  }
  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};