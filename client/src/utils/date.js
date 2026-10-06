/**
 * Date utility helpers for WeShare
 */

/**
 * Returns current year-month key, e.g. "2026-10"
 */
export const getCurrentMonthKey = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Extracts year-month key from any ISO or date string, e.g. "2026-10"
 */
export const getMonthKey = (dateString) => {
  if (!dateString) return 'unknown';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'unknown';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Converts a "YYYY-MM" key into a human-readable string, e.g. "October 2026"
 */
export const formatMonthLabel = (monthKey) => {
  if (!monthKey || monthKey === 'unknown') return 'Unknown Date';
  const parts = monthKey.split('-').map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return 'Unknown Date';
  const [year, month] = parts;
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

/**
 * Formats a date string to short format, e.g. "Oct 6, 2026"
 */
export const formatShortDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Formats a date string to full descriptive format, e.g. "Tuesday, October 6, 2026"
 */
export const formatFullDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Returns today's date formatted as "YYYY-MM-DD" for HTML date input values
 */
export const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
