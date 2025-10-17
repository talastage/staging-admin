// composables/useBioManager.ts
import { ref, computed } from 'vue'
import { useNuxtApp } from '#app'

export const useBioManager = () => {
  const { $axios } = useNuxtApp()

  // State
  const loading = ref(false)
  const error = ref('')
  const success = ref(false)

  // Methods
  const updateBio = async (bio: string) => {
    try {
      loading.value = true
      error.value = ''
      success.value = false

      const response = await $axios.put('/api/user/bio', {
        bio: bio.trim() || null,
      })

      if (response.data.success) {
        success.value = true
        return {
          success: true,
          bio: response.data.data.bio,
          wordCount: response.data.data.word_count,
        }
      } else {
        throw new Error(response.data.message || 'Failed to update bio')
      }
    } catch (err) {
      error.value =
        err.response?.data?.message || err.message || 'Failed to update bio'
      console.error('Error updating bio:', err)
      return {
        success: false,
        error: error.value,
      }
    } finally {
      loading.value = false
    }
  }

  const getBioWordCount = (text: string) => {
    if (!text?.trim()) return 0
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
  }

  const validateBio = (text: string, maxWords = 200, maxChars = 1000) => {
    const errors = []

    if (text.length > maxChars) {
      errors.push(`Bio cannot exceed ${maxChars} characters`)
    }

    const wordCount = getBioWordCount(text)
    if (wordCount > maxWords) {
      errors.push(`Bio cannot exceed ${maxWords} words`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      wordCount,
      charCount: text.length,
    }
  }

  return {
    // State
    loading,
    error,
    success,

    // Methods
    updateBio,
    getBioWordCount,
    validateBio,
  }
}
