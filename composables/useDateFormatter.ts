// composables/useDateFormatter.ts

export function useDateFormatter() {
  const formatRelativeDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const isFuture = diffTime < 0
    const diffSeconds = Math.floor(Math.abs(diffTime) / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)

    // Helper to format time units
    const formatUnit = (value: number, unit: string) =>
      `${value} ${unit}${value !== 1 ? 's' : ''}`

    // Build the time string
    let timeString = ''
    if (diffSeconds < 60) {
      timeString = 'just now'
    } else if (diffMinutes < 60) {
      timeString = formatUnit(diffMinutes, 'minute')
    } else if (diffHours < 24) {
      timeString = formatUnit(diffHours, 'hour')
    } else if (diffDays < 7) {
      timeString = formatUnit(diffDays, 'day')
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      timeString = formatUnit(weeks, 'week')
    } else if (diffMonths < 12) {
      timeString = formatUnit(diffMonths, 'month')
    } else {
      timeString = formatUnit(diffYears, 'year')
    }

    // Add "in" prefix for future dates or "ago" suffix for past dates
    if (timeString !== 'just now') {
      timeString = isFuture ? `in ${timeString}` : `${timeString} ago`
    }

    return timeString
  }

  const formatLocalDateTime = (dateString: string): string => {
    const date = new Date(dateString)
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]

    const day = date.getDate()
    const month = months[date.getMonth()]
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    return `${day} ${month} at ${hours}:${minutes}`
  }

  return {
    formatRelativeDate,
    formatLocalDateTime,
  }
}
