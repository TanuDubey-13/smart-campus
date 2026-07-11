/**
 * Formats a date to a relative time string (e.g., "3 hours ago", "just now").
 * @param {string|Date} date - The date to format.
 * @returns {string} The relative time string.
 */
export function formatDistanceToNow(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now - d;
  
  if (isNaN(diffMs)) return 'some time ago';

  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) return 'just now';

  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}
