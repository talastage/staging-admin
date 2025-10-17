// composables/useShare.ts
import { ref, readonly } from 'vue'

export interface SharePlatform {
  name: string
  icon: string
  color: string
  shareUrl: (text: string, url: string) => string
  mobileOnly?: boolean
}

// Static platform configurations - no need to recreate these
const SHARE_PLATFORMS: Readonly<SharePlatform[]> = Object.freeze([
  {
    name: 'WhatsApp',
    icon: 'mdi-whatsapp',
    color: '#25D366',
    shareUrl: (text, url) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${text}\n\n${url}`
      )}`,
  },
  {
    name: 'X',
    icon: 'mdi-twitter',
    color: '#1DA1F2',
    shareUrl: (text, url) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(url)}`,
  },
  {
    name: 'Facebook',
    icon: 'mdi-facebook',
    color: '#1877F2',
    shareUrl: (_, url) =>
      `https://www.facebook.com/share.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'LinkedIn',
    icon: 'mdi-linkedin',
    color: '#0A66C2',
    shareUrl: (text, url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}&title=${encodeURIComponent(text)}`,
  },
  {
    name: 'Telegram',
    icon: 'mdi-telegram',
    color: '#0088cc',
    shareUrl: (text, url) =>
      `https://t.me/share/url?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(text)}`,
  },
  {
    name: 'Email',
    icon: 'mdi-email',
    color: '#D44638',
    shareUrl: (text, url) =>
      `mailto:?subject=${encodeURIComponent(
        'Check this out!'
      )}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
  },
])

// Cached values
let isMobileCache: boolean | null = null
let isSecureContextCache: boolean | null = null
let hasClipboardCache: boolean | null = null

// Efficient mobile detection with caching
const detectMobile = (): boolean => {
  if (typeof window === 'undefined') return false

  if (isMobileCache === null) {
    isMobileCache =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
  }

  return isMobileCache
}

// Check clipboard support with caching
const hasClipboardSupport = (): boolean => {
  if (typeof window === 'undefined') return false

  if (hasClipboardCache === null) {
    hasClipboardCache = !!(navigator.clipboard && window.isSecureContext)
  }

  return hasClipboardCache
}

// Check secure context with caching
const isSecureContext = (): boolean => {
  if (typeof window === 'undefined') return false

  if (isSecureContextCache === null) {
    isSecureContextCache =
      window.isSecureContext || location.protocol === 'https:'
  }

  return isSecureContextCache
}

// Window features for sharing popup - pre-calculated
const POPUP_FEATURES = (() => {
  const features = {
    width: 550,
    height: 400,
    menubar: 'no',
    toolbar: 'no',
    status: 'no',
    resizable: 'yes',
    scrollbars: 'yes',
  }

  return Object.entries(features)
    .map(([key, value]) => `${key}=${value}`)
    .join(',')
})()

export function useShare() {
  // Single reactive state for sharing status
  const isSharing = ref(false)

  // Get available platforms (filtered once)
  const getAvailablePlatforms = () => {
    return SHARE_PLATFORMS.filter(
      (platform) => !platform.mobileOnly || detectMobile()
    )
  }

  // Optimized share window opener
  const openShareWindow = (url: string, platform: string) => {
    if (typeof window === 'undefined') return

    try {
      const left = Math.max(0, (window.screen.width - 550) / 2)
      const top = Math.max(0, (window.screen.height - 400) / 2)
      const featuresWithPosition = `${POPUP_FEATURES},left=${left},top=${top}`

      const popup = window.open(url, `share_${platform}`, featuresWithPosition)

      // Focus popup if it opened successfully
      if (popup) {
        popup.focus()
      }
    } catch (error) {
      console.warn('Failed to open share popup:', error)
      // Fallback: open in same window
      window.open(url, '_blank')
    }
  }

  // Efficient share function
  const shareTo = async (
    platform: string,
    url: string,
    text: string,
    entityType?: string,
    entityId?: string
  ) => {
    // Early return if already sharing
    if (isSharing.value || !url) return

    const platformConfig = SHARE_PLATFORMS.find((p) => p.name === platform)
    if (!platformConfig) {
      throw new Error(`Platform ${platform} not supported`)
    }

    isSharing.value = true

    try {
      const shareUrl = platformConfig.shareUrl(text, url)

      // Track share asynchronously (don't block UI)
      if (entityType && entityId) {
        trackShare(entityType, entityId, platform).catch(console.warn)
      }

      // Handle different platform types
      if (platform === 'Email') {
        window.location.href = shareUrl
      } else {
        openShareWindow(shareUrl, platform)
      }
    } finally {
      // Reset sharing state after a short delay
      setTimeout(() => {
        isSharing.value = false
      }, 500)
    }
  }

  // Optimized copy function with multiple fallbacks
  const copyLink = async (url: string): Promise<void> => {
    if (!url) throw new Error('No URL to copy')

    // Modern clipboard API (fastest)
    if (hasClipboardSupport()) {
      try {
        await navigator.clipboard.writeText(url)
        return
      } catch (error) {
        console.warn('Clipboard API failed, trying fallback:', error)
      }
    }

    // Fallback method
    return new Promise((resolve, reject) => {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = url
        textarea.style.cssText =
          'position:fixed;left:-9999px;top:-9999px;opacity:0'

        document.body.appendChild(textarea)
        textarea.select()
        textarea.setSelectionRange(0, textarea.value.length)

        const success = document.execCommand('copy')
        document.body.removeChild(textarea)

        if (success) {
          resolve()
        } else {
          reject(new Error('Copy command failed'))
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  // Async share tracking (non-blocking)
  const trackShare = async (
    entityType: string,
    entityId: string,
    platform: string
  ): Promise<void> => {
    // Skip if no required params
    if (!entityType || !entityId || !platform) return

    try {
      const { $axios } = useNuxtApp()
      if (!$axios) return

      // Fire and forget - don't await
      $axios
        .post(`/api/share/${entityType}/${entityId}/track`, {
          platform,
          timestamp: Date.now(), // More efficient than new Date().toISOString()
          userAgent: navigator.userAgent,
          isMobile: detectMobile(),
        })
        .catch(console.warn) // Catch but don't throw
    } catch (error) {
      // Silently fail - tracking shouldn't break sharing
      console.warn('Share tracking failed:', error)
    }
  }

  return {
    // Readonly platforms array
    sharePlatforms: readonly(getAvailablePlatforms()),

    // Main functions
    shareTo,
    copyLink,
    trackShare,

    // Utility functions
    isMobileDevice: detectMobile,

    // State
    isSharing: readonly(isSharing),
  }
}
