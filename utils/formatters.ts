// utils/formatters.ts

import { isToday } from './helpers'

export const avatarText = (value: string) => {
  if (!value) return ''
  const nameArray = value.split(' ')
  return nameArray.map((word) => word.charAt(0).toUpperCase()).join('')
}

// TODO: Try to implement this: https://twitter.com/fireship_dev/status/1565424801216311297
export const kFormatter = (num: number) => {
  const regex = /\B(?=(\d{3})+(?!\d))/g
  return Math.abs(num) > 9999
    ? `${Math.sign(num) * +(Math.abs(num) / 1000).toFixed(1)}k`
    : Math.abs(num).toFixed(0).replace(regex, ',')
}

/**
 * Format and return date in Humanize format
 * Intl docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/format
 * Intl Constructor: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 * @param {string} value date to format
 * @param {Intl.DateTimeFormatOptions} formatting Intl object to format with
 */
export const formatDate = (
  value: string,
  formatting: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
) => {
  if (!value) return value
  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value))
}

/**
 * Return short human friendly month representation of date
 * Can also convert date to only time if date is of today (Better UX)
 * @param {string} value date to format
 * @param {boolean} toTimeForCurrentDay Shall convert to time if day is today/current
 */
export const formatDateToMonthShort = (
  value: string,
  toTimeForCurrentDay = true
) => {
  const date = new Date(value)
  let formatting: Record<string, string> = { month: 'short', day: 'numeric' }
  if (toTimeForCurrentDay && isToday(date))
    formatting = { hour: 'numeric', minute: 'numeric' }
  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value))
}

/**
 * Formats a number into currency.
 * @param value The number to format.
 * @param currency The currency code, e.g., 'USD' for US Dollar.
 * @param locale The locale string, e.g., 'en-US' for US English.
 * @returns {string} The formatted currency string.
 */
export const currencyFilter = (
  value: number | string,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numericValue)) {
    return ''
  }
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return formatter.format(numericValue)
}

export const prefixWithPlus = (value: number) =>
  value > 0 ? `+${value}` : value

/**
 * Format view count for display
 * @param {number} views Number of views
 * @returns {string} Formatted view count
 */
export const formatViews = (views: number): string => {
  return `${kFormatter(views)} views`
}

/**
 * Format like count for display
 * @param {number} likes Number of likes
 * @returns {string} Formatted like count
 */
export const formatLikes = (likes: number): string => {
  return kFormatter(likes)
}

/**
 * Format duration in seconds to a human-readable string
 * @param {number} seconds Duration in seconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const capitalizeFirst = (str: string): string => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Format file size to human readable format
 * @param {number} bytes Size in bytes
 * @returns {string} Formatted size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Format time remaining for upload
 * @param {number} seconds Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTimeRemaining = (seconds: number): string => {
  if (seconds < 0) return 'Almost done...'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s left`
}

/**
 * Formats a phone number for display
 * @param phone - The phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return ''

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')

  // Format based on length
  if (cleaned.length === 12) {
    // Format: +XXX XXX XXX XXX
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
      6,
      9
    )} ${cleaned.slice(9)}`
  } else if (cleaned.length === 10) {
    // Format: XXX XXX XXXX
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }

  // Return original if no formatting rules match
  return phone
}

/**
 * Creates a WhatsApp link from a phone number
 * @param phone - The phone number to create a link for
 * @returns WhatsApp URL
 */
export const createWhatsAppLink = (phone: string): string => {
  if (!phone) return '#'
  const cleaned = phone.replace(/\D/g, '')
  return `https://wa.me/${cleaned}`
}

/**
 * Formats a timezone into a readable current time
 * @param timezone - The timezone to format
 * @returns Formatted current time in the specified timezone
 */
export const formatTimezone = (timezone: string): string => {
  if (!timezone) return ''

  try {
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      timeStyle: 'short',
      hour12: true,
    }
    return `Current time: ${now.toLocaleTimeString('en-US', options)}`
  } catch (e) {
    console.error('Timezone formatting error:', e)
    return timezone
  }
}
