// utils/formatters/notificationCount.ts

/**
 * Formats notification counts for display in badges
 * - Shows exact number for counts < 1000
 * - Shows "1k" for 1000-9999
 * - Shows "9.9k+" for counts >= 10000
 *
 * @param {number} count - The notification count to format
 * @returns {string} Formatted notification count
 */
export const formatNotificationCount = (count: number): string => {
  if (!count || count <= 0) return '0'

  if (count < 1000) {
    return count.toString()
  } else if (count < 10000) {
    return `${Math.floor(count / 1000)}k`
  } else {
    // Cap at 9.9k+ for very large numbers
    const formattedCount = Math.min(count, 9900) / 1000
    return `${formattedCount.toFixed(1)}k+`
  }
}

/**
 * Determines if a notification count is high enough to require truncation
 * This can be used for setting a CSS class for smaller font size
 *
 * @param {number} count - The notification count to check
 * @returns {boolean} True if count is high and needs smaller text
 */
export const isHighNotificationCount = (count: number): boolean => {
  return count >= 1000
}
