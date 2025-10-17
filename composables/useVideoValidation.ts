import { ref } from 'vue'

interface VideoValidationOptions {
  maxFileSize?: number
  allowedFormats?: string[]
  maxDuration?: number
  maxResolution?: string
}

export function useVideoValidation() {
  const validationError = ref<string | null>(null)

  /**
   * Get video metadata (duration, width, height) using HTML5 video element
   */
  function getVideoMetadata(
    file: File
  ): Promise<{ duration: number; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'

      video.onloadedmetadata = () => {
        const metadata = {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
        }
        window.URL.revokeObjectURL(video.src)
        resolve(metadata)
      }

      video.onerror = () => {
        reject(new Error('Could not load video metadata'))
      }

      video.src = URL.createObjectURL(file)
    })
  }

  /**
   * Get video duration using HTML5 video element
   */
  function getVideoDuration(file: File): Promise<number> {
    return getVideoMetadata(file).then((metadata) => metadata.duration)
  }

  /**
   * Format file size in bytes to human-readable string
   */
  function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  /**
   * Format duration in seconds to a human-readable string
   */
  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${Math.ceil(seconds)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.ceil(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  /**
   * Format time remaining for upload progress
   */
  function formatTimeRemaining(seconds: number): string {
    if (seconds < 60) return `${Math.ceil(seconds)}s remaining`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.ceil(seconds % 60)
    return `${minutes}m ${remainingSeconds}s remaining`
  }

  /**
   * Validate file size
   */
  function validateFileSize(fileSize: number, maxSize: number): boolean {
    return fileSize <= maxSize
  }

  /**
   * Validate file format
   */
  function validateFormat(mimeType: string, allowedFormats: string[]): boolean {
    return allowedFormats.some(
      (format) => mimeType.toLowerCase() === `video/${format.toLowerCase()}`
    )
  }

  /**
   * Validate video duration
   */
  function validateDuration(duration: number, maxDuration: number): boolean {
    return duration <= maxDuration
  }

  /**
   * Parse resolution string to get max dimensions
   */
  function parseResolution(resolution: string): { maxWidth: number; maxHeight: number } {
    // Handle common resolution formats (case-insensitive)
    const res = resolution?.toLowerCase() || ''
    if (res === '4k' || res === '2160p') {
      return { maxWidth: 4096, maxHeight: 2160 } // Allow both 4K UHD (3840x2160) and 4K DCI (4096x2160)
    }
    if (resolution === '1440p') return { maxWidth: 2560, maxHeight: 1440 }
    if (resolution === '1080p') return { maxWidth: 1920, maxHeight: 1080 }
    if (resolution === '720p') return { maxWidth: 1280, maxHeight: 720 }
    if (resolution === '480p') return { maxWidth: 854, maxHeight: 480 }
    if (resolution === '360p') return { maxWidth: 640, maxHeight: 360 }
    if (resolution === '240p') return { maxWidth: 426, maxHeight: 240 }

    // Try to parse numeric part (assume 16:9 aspect ratio)
    const match = resolution.match(/(\d+)p?/)
    if (match) {
      const height = parseInt(match[1], 10)
      const width = Math.round((height * 16) / 9)
      return { maxWidth: width, maxHeight: height }
    }

    return { maxWidth: 0, maxHeight: 0 }
  }

  /**
   * Validate video resolution
   */
  function validateResolution(
    width: number,
    height: number,
    maxResolution: string
  ): boolean {
    const { maxWidth, maxHeight } = parseResolution(maxResolution)
    return width <= maxWidth && height <= maxHeight
  }

  /**
   * Validate video file against requirements
   */
  async function validateVideo(
    file: File,
    options: VideoValidationOptions
  ): Promise<{ isValid: boolean; error: string | null }> {
    validationError.value = null

    // Check file size
    if (
      options.maxFileSize &&
      !validateFileSize(file.size, options.maxFileSize)
    ) {
      validationError.value = `File size exceeds the maximum allowed (${formatSize(
        options.maxFileSize
      )}).`
      return { isValid: false, error: validationError.value }
    }

    // Check file format
    if (
      options.allowedFormats &&
      options.allowedFormats.length > 0 &&
      !validateFormat(file.type, options.allowedFormats)
    ) {
      validationError.value = `Invalid file format. Only ${options.allowedFormats.join(
        ', '
      )} videos are allowed.`
      return { isValid: false, error: validationError.value }
    }

    // Check video duration and resolution
    if (
      options.maxDuration !== undefined ||
      options.maxResolution !== undefined
    ) {
      try {
        const metadata = await getVideoMetadata(file)

        // Check duration
        if (
          options.maxDuration !== undefined &&
          !validateDuration(metadata.duration, options.maxDuration)
        ) {
          validationError.value = `Video duration exceeds the maximum allowed (${formatDuration(
            options.maxDuration
          )}).`
          return { isValid: false, error: validationError.value }
        }

        // Check resolution
        if (
          options.maxResolution &&
          !validateResolution(
            metadata.width,
            metadata.height,
            options.maxResolution
          )
        ) {
          validationError.value = `Video resolution (${metadata.width}x${metadata.height}) exceeds the maximum allowed (${options.maxResolution}).`
          return { isValid: false, error: validationError.value }
        }
      } catch (err) {
        validationError.value =
          'Could not validate video metadata. Please try another file.'
        return { isValid: false, error: validationError.value }
      }
    }

    return { isValid: true, error: null }
  }

  return {
    validateVideo,
    validateFileSize,
    validateFormat,
    validateDuration,
    validateResolution,
    parseResolution,
    validationError,
    getVideoDuration,
    getVideoMetadata,
    formatSize,
    formatDuration,
    formatTimeRemaining,
  }
}
