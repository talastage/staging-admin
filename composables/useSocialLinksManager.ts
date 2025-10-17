// composables/useSocialLinksManager.ts
import { ref, reactive, computed } from 'vue'
import { useNuxtApp } from '#app'

export const useSocialLinksManager = () => {
  const { $axios } = useNuxtApp()

  // State
  const loading = ref(false)
  const error = ref('')
  const success = ref(false)

  // Social platforms configuration
  const socialPlatforms = {
    tiktok: {
      name: 'TikTok',
      icon: 'mdi-music-note',
      color: '#000000',
      placeholder: 'https://www.tiktok.com/@username',
    },
    youtube: {
      name: 'YouTube',
      icon: 'mdi-youtube',
      color: '#FF0000',
      placeholder: 'https://www.youtube.com/channel/...',
    },
    instagram: {
      name: 'Instagram',
      icon: 'mdi-instagram',
      color: '#E4405F',
      placeholder: 'https://www.instagram.com/username',
    },
    facebook: {
      name: 'Facebook',
      icon: 'mdi-facebook',
      color: '#1877F2',
      placeholder: 'https://www.facebook.com/username',
    },
    twitter: {
      name: 'Twitter',
      icon: 'mdi-twitter',
      color: '#1DA1F2',
      placeholder: 'https://twitter.com/username',
    },
    linkedin: {
      name: 'LinkedIn',
      icon: 'mdi-linkedin',
      color: '#0A66C2',
      placeholder: 'https://www.linkedin.com/in/username',
    },
    telegram: {
      name: 'Telegram',
      icon: 'mdi-telegram',
      color: '#0088CC',
      placeholder: 'https://t.me/username',
    },
    website: {
      name: 'Website',
      icon: 'mdi-web',
      color: '#6366F1',
      placeholder: 'https://www.yourwebsite.com',
    },
  }

  // Methods
  const updateSocialLinks = async (links: Record<string, string>) => {
    try {
      loading.value = true
      error.value = ''
      success.value = false

      // Prepare data (convert empty strings to null)
      const dataToSend = {}
      Object.keys(links).forEach((key) => {
        dataToSend[key] = links[key]?.trim() || null
      })

      const response = await $axios.put('/api/user/social-links', dataToSend)

      if (response.data.success) {
        success.value = true
        return {
          success: true,
          data: response.data.data,
        }
      } else {
        throw new Error(
          response.data.message || 'Failed to update social links'
        )
      }
    } catch (err) {
      error.value =
        err.response?.data?.message ||
        err.message ||
        'Failed to update social links'
      console.error('Error updating social links:', err)
      return {
        success: false,
        error: error.value,
        validationErrors: err.response?.data?.errors || {},
      }
    } finally {
      loading.value = false
    }
  }

  const removeSocialLink = async (platform: string) => {
    try {
      loading.value = true
      error.value = ''

      const response = await $axios.delete('/api/user/social-links/remove', {
        data: { platform },
      })

      if (response.data.success) {
        return { success: true }
      } else {
        throw new Error(response.data.message || 'Failed to remove social link')
      }
    } catch (err) {
      error.value =
        err.response?.data?.message ||
        err.message ||
        'Failed to remove social link'
      return {
        success: false,
        error: error.value,
      }
    } finally {
      loading.value = false
    }
  }

  const validateSocialLink = (url: string) => {
    if (!url?.trim()) return { isValid: true, error: null }

    try {
      new URL(url.trim())
      return { isValid: true, error: null }
    } catch {
      return { isValid: false, error: 'Please enter a valid URL' }
    }
  }

  const getPlatformInfo = (platform: string) => {
    return (
      socialPlatforms[platform] || {
        name: platform.charAt(0).toUpperCase() + platform.slice(1),
        icon: 'mdi-link',
        color: 'primary',
        placeholder: 'https://...',
      }
    )
  }

  const filterActiveLinks = (links: Record<string, string>) => {
    const activeLinks = {}
    Object.keys(links).forEach((key) => {
      if (links[key]?.trim()) {
        activeLinks[key] = links[key].trim()
      }
    })
    return activeLinks
  }

  return {
    // State
    loading,
    error,
    success,
    socialPlatforms,

    // Methods
    updateSocialLinks,
    removeSocialLink,
    validateSocialLink,
    getPlatformInfo,
    filterActiveLinks,
  }
}
