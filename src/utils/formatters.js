// Utility functions for formatting data

/**
 * Format status text by adding spaces between words
 * Handles various formats: camelCase, PascalCase, etc.
 * @param {string} status - Status value (e.g., "PostSecondary", "SingaporeCitizen")
 * @returns {string} Formatted status text with spaces
 */
export const formatStatus = (status) => {
  if (!status || status === '—' || status === '-') return '—';
  
  // Add space before capital letters and numbers, then trim
  return status
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // camelCase to spaces
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')  // PascalCase to spaces
    .trim();
};

/**
 * Format currency to display with $ and 2 decimal places
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00';
  return `$${Number(amount).toFixed(2)}`;
};

/**
 * Format number with comma separators
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted number string with commas
 */
export const formatNumberWithCommas = (num, decimals = 0) => {
  if (num === null || num === undefined) return '0';
  const number = Number(num);
  return number.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Format date to dd/MM/yyyy format
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted date string in dd/MM/yyyy format
 */
export const formatDate = (date) => {
  if (!date || date === '—' || date === '-') return '—';
  
  try {
    let dateObj;
    
    // If it's already in dd/MM/yy or dd/MM/yyyy format, return as is or convert
    if (typeof date === 'string' && /^\d{2}\/\d{2}\/\d{2,4}$/.test(date)) {
      const parts = date.split('/');
      if (parts[2].length === 2) {
        // Convert yy to yyyy
        return `${parts[0]}/${parts[1]}/20${parts[2]}`;
      }
      return date;
    }
    
    // If it's in "13 Jan 2026" format, convert to dd/MM/yyyy
    if (typeof date === 'string' && /^\d{1,2}\s+\w{3}\s+\d{4}$/.test(date)) {
      dateObj = new Date(date);
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    
    if (isNaN(dateObj.getTime())) {
      return date; // Return original if invalid
    }
    
    // Convert UTC to UTC+7
    const utcTime = dateObj.getTime();
    const utcOffset = dateObj.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
    const utc7Offset = 7 * 60 * 60000; // UTC+7 in milliseconds
    const localTime = new Date(utcTime + utcOffset + utc7Offset);
    
    const day = String(localTime.getDate()).padStart(2, '0');
    const month = String(localTime.getMonth() + 1).padStart(2, '0');
    const year = localTime.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    return date; // Return original if error
  }
};

/**
 * Format datetime to dd/MM/yyyy HH:mm format with UTC+7 timezone adjustment
 * @param {string|Date} datetime - Datetime string or Date object
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (datetime) => {
  if (!datetime || datetime === '—' || datetime === '-') return '—';
  
  try {
    const dateObj = new Date(datetime);
    
    if (isNaN(dateObj.getTime())) {
      return datetime; // Return original if invalid
    }
    
    // Convert UTC to UTC+7
    const utcTime = dateObj.getTime();
    const utcOffset = dateObj.getTimezoneOffset() * 60000;
    const utc7Offset = 7 * 60 * 60000;
    const localTime = new Date(utcTime + utcOffset + utc7Offset);
    
    const day = String(localTime.getDate()).padStart(2, '0');
    const month = String(localTime.getMonth() + 1).padStart(2, '0');
    const year = localTime.getFullYear();
    const hours = String(localTime.getHours()).padStart(2, '0');
    const minutes = String(localTime.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    return datetime;
  }
};

export const formatEnumLabel = (text = "") => {
  if (!text) return "";

  return text
    // Thêm khoảng trắng trước chữ in hoa
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    // Trường hợp đặc biệt: Post Secondary → Post-Secondary
    .replace(/^Post Secondary$/, "Post-Secondary")

    .replace(/^Post Graduate$/, "Post-Graduate")
    // Viết hoa chữ cái đầu
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
