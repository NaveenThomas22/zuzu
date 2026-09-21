/**
 * Format a numeric value as Indian Rupee currency.
 * Does NOT generate numbers — only formats what is provided.
 *
 * @param {number|string} value - The numeric value to format
 * @param {object} [options]
 * @param {boolean} [options.showSymbol=true] - Show ₹ symbol
 * @param {number} [options.decimals=0] - Decimal places
 * @returns {string}
 */
export function formatCurrency(value, { showSymbol = true, decimals = 0 } = {}) {
  if (value === null || value === undefined || value === '') {
    return showSymbol ? '₹ --' : '--';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return showSymbol ? '₹ --' : '--';
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(numValue));

  const sign = numValue < 0 ? '-' : '';

  return showSymbol ? `${sign}₹ ${formatted}` : `${sign}${formatted}`;
}

/**
 * Format a value as a compact currency string (e.g., ₹ 1.2L, ₹ 50K)
 */
export function formatCurrencyCompact(value) {
  if (value === null || value === undefined) return '₹ --';

  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '₹ --';

  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (abs >= 10000000) return `${sign}₹ ${(abs / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `${sign}₹ ${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${sign}₹ ${(abs / 1000).toFixed(1)}K`;
  return `${sign}₹ ${abs.toFixed(0)}`;
}
