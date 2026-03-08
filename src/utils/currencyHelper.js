/**
 * Currency Helper for POS System
 * Supports USD and Khmer Riel (KHR)
 */

// Exchange rate: 1 USD = 4100 KHR (approximate, update as needed)
export const EXCHANGE_RATE = 4100;

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - 'USD' or 'KHR'
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  const num = parseFloat(amount) || 0;
  
  if (currency === 'KHR') {
    // Riel: No decimals, use Khmer Riel symbol
    return `${Math.round(num).toLocaleString('en-US')}៛`;
  }
  
  // USD: Support up to 2 decimal places (0.01, 0.1, 1.00)
  // Always show at least 2 decimals for consistency
  return `$${num.toFixed(2)}`;
};

/**
 * Convert amount between currencies
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @returns {number} Converted amount
 */
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;
  
  if (fromCurrency === 'USD' && toCurrency === 'KHR') {
    return amount * EXCHANGE_RATE;
  }
  
  if (fromCurrency === 'KHR' && toCurrency === 'USD') {
    return amount / EXCHANGE_RATE;
  }
  
  return amount;
};

/**
 * Parse currency input (handles both USD and KHR)
 * @param {string} input - User input string
 * @param {string} currency - Current currency
 * @returns {number} Parsed number
 */
export const parseCurrencyInput = (input, currency = 'USD') => {
  // Remove currency symbols and commas
  const cleaned = input.replace(/[$៛,]/g, '').trim();
  const num = parseFloat(cleaned);
  
  if (isNaN(num)) return 0;
  
  // For KHR, round to whole number
  if (currency === 'KHR') {
    return Math.round(num);
  }
  
  // For USD, allow up to 2 decimal places (0.01, 0.10, 1.00)
  return Math.round(num * 100) / 100;
};

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currency) => {
  return currency === 'KHR' ? '៛' : '$';
};

/**
 * Get currency name
 * @param {string} currency - Currency code
 * @returns {string} Currency name
 */
export const getCurrencyName = (currency) => {
  return currency === 'KHR' ? 'Khmer Riel' : 'US Dollar';
};

/**
 * Format currency for input field
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted string for input
 */
export const formatCurrencyForInput = (amount, currency = 'USD') => {
  const num = parseFloat(amount) || 0;
  
  if (currency === 'KHR') {
    return Math.round(num).toString();
  }
  
  // USD: Show 2 decimals for input (0.01, 0.10, 1.00)
  return num.toFixed(2);
};
