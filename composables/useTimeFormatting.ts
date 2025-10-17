// composables/useTimeFormatting.ts

interface TimeFormattingOptions {
  showSeconds?: boolean
  shortFormat?: boolean
  locale?: string
}

export function useTimeFormatting() {
  /**
   * Formats duration from seconds to human readable format
   */
  const formatDuration = (
    seconds: number,
    options: TimeFormattingOptions = {}
  ): string => {
    if (isNaN(seconds)) return 'Invalid duration'
    if (seconds < 0) return 'Almost done...'

    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return options.shortFormat
        ? `${hours}h ${remainingMinutes}m`
        : `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${
            remainingMinutes !== 1 ? 's' : ''
          }`
    }

    if (minutes > 0) {
      const secondsPart = options.showSeconds ? ` ${remainingSeconds}s` : ''
      return options.shortFormat
        ? `${minutes}m${secondsPart}`
        : `${minutes} minute${minutes !== 1 ? 's' : ''}${
            options.showSeconds
              ? ` ${remainingSeconds} second${
                  remainingSeconds !== 1 ? 's' : ''
                }`
              : ''
          }`
    }

    return options.shortFormat
      ? `${seconds}s`
      : `${seconds} second${seconds !== 1 ? 's' : ''}`
  }

  /**
   * Other formatting functions remain unchanged
   */
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return 'Invalid duration'
    if (seconds < 0) return 'Almost done...'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}m ${remainingSeconds}s left`
  }

  const formatTimeOfDay = (
    date: Date | string,
    options: TimeFormattingOptions = {}
  ): string => {
    const d = new Date(date)
    return d.toLocaleTimeString(options.locale || 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatCountdown = (
    targetDate: Date | string,
    options: TimeFormattingOptions = {}
  ): string => {
    const target = new Date(targetDate).getTime()
    const now = new Date().getTime()
    const diff = Math.floor((target - now) / 1000) // in seconds

    if (diff <= 0) return 'Expired'

    const days = Math.floor(diff / (60 * 60 * 24))
    const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60))
    const minutes = Math.floor((diff % (60 * 60)) / 60)
    const seconds = diff % 60

    if (days > 0) {
      return options.shortFormat
        ? `${days}d ${hours}h`
        : `${days} day${days !== 1 ? 's' : ''} ${hours} hour${
            hours !== 1 ? 's' : ''
          }`
    }

    if (hours > 0) {
      return options.shortFormat
        ? `${hours}h ${minutes}m`
        : `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${
            minutes !== 1 ? 's' : ''
          }`
    }

    if (minutes > 0) {
      return options.shortFormat
        ? `${minutes}m ${seconds}s`
        : `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${
            seconds !== 1 ? 's' : ''
          }`
    }

    return options.shortFormat
      ? `${seconds}s`
      : `${seconds} second${seconds !== 1 ? 's' : ''}`
  }

  const formatTimeRange = (
    startTime: string | Date,
    endTime: string | Date,
    options: TimeFormattingOptions = {}
  ): string => {
    const start = new Date(startTime)
    const end = new Date(endTime)

    return `${formatTimeOfDay(start, options)} - ${formatTimeOfDay(
      end,
      options
    )}`
  }

  const timeToSeconds = (timeString: string): number => {
    const regex = /(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/
    const matches = timeString.match(regex)

    if (!matches) return 0

    const hours = parseInt(matches[1] || '0')
    const minutes = parseInt(matches[2] || '0')
    const seconds = parseInt(matches[3] || '0')

    return hours * 3600 + minutes * 60 + seconds
  }

  return {
    formatTime,
    formatDuration,
    formatTimeOfDay,
    formatCountdown,
    formatTimeRange,
    timeToSeconds,
  }
}
