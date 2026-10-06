/**
 * Formats a numeric value into Myanmar Kyat (Ks) with thousand separators
 * @param {number|string} value - The numerical amount
 * @param {boolean} showFraction - Whether to show up to 2 decimal places if present
 * @returns {string} Formatted string, e.g. "15,000 Ks" or "15,000.50 Ks"
 */
export const formatMMK = (value, showFraction = true) => {
  const num = Number(value) || 0;
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: showFraction ? 2 : 0,
  });
  return `${formatted} Ks`;
};

/**
 * Formats a numeric value with thousand separators only (without currency suffix)
 */
export const formatNumber = (value, showFraction = true) => {
  const num = Number(value) || 0;
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: showFraction ? 2 : 0,
  });
};

/**
 * Returns signed MMK string, e.g. "+15,000 Ks" or "-5,000 Ks" or "0 Ks"
 */
export const formatSignedMMK = (value) => {
  const num = Number(value) || 0;
  if (Math.abs(num) < 0.0001) return '0 Ks';
  const sign = num > 0 ? '+' : '-';
  const formatted = Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${sign}${formatted} Ks`;
};

/**
 * Returns signed number string without currency symbol, e.g. "+15,000" or "-5,000" or "0"
 */
export const formatSignedNumber = (value) => {
  const num = Number(value) || 0;
  if (Math.abs(num) < 0.0001) return '0';
  const sign = num > 0 ? '+' : '-';
  const formatted = Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${sign}${formatted}`;
};

