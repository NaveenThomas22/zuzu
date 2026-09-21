/**
 * Format a date string or Date object for display.
 *
 * @param {string|Date} dateValue
 * @param {object} [options]
 * @param {'short'|'medium'|'long'} [options.format='medium']
 * @returns {string}
 */
export function formatDate(dateValue, { format = 'medium' } = {}) {
  if (!dateValue) return '--';

  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  if (isNaN(date.getTime())) return '--';

  const formats = {
    short: { day: 'numeric', month: 'short' },
    medium: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' },
  };

  return date.toLocaleDateString('en-IN', formats[format] || formats.medium);
}

/**
 * Format a datetime string for display (includes time).
 */
export function formatDateTime(dateValue) {
  if (!dateValue) return '--';

  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  if (isNaN(date.getTime())) return '--';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get a relative time string (e.g., "2 days ago").
 */
export function formatRelativeTime(dateValue) {
  if (!dateValue) return '--';

  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  if (isNaN(date.getTime())) return '--';

  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(date, { format: 'short' });
}

/**
 * Get the current month and year as { year, month }.
 */
export function getCurrentMonthYear() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/**
 * Format a month number (1-12) to month name.
 */
export function getMonthName(month) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return months[(month - 1) % 12] || '--';
}
