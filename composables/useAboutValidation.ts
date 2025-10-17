// composables/useAboutValidation.ts
import { ref, computed } from 'vue'

export const useAboutValidation = () => {
  // Constants
  const MAX_BIO_WORDS = 200
  const MAX_BIO_CHARS = 1000

  // Validation methods
  const validateUrl = (url: string) => {
    if (!url?.trim()) return { isValid: true, error: null }

    try {
      new URL(url.trim())
      return { isValid: true, error: null }
    } catch {
      return { isValid: false, error: 'Please enter a valid URL' }
    }
  }

  const validateBio = (text: string) => {
    const errors = []

    if (!text?.trim()) return { isValid: true, errors: [] }

    if (text.length > MAX_BIO_CHARS) {
      errors.push(`Bio cannot exceed ${MAX_BIO_CHARS} characters`)
    }

    const wordCount = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
    if (wordCount > MAX_BIO_WORDS) {
      errors.push(`Bio cannot exceed ${MAX_BIO_WORDS} words`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      wordCount,
      charCount: text.length,
    }
  }

  const validateSocialLinks = (links: Record<string, string>) => {
    const errors: Record<string, string[]> = {}
    let isValid = true

    Object.entries(links).forEach(([platform, url]) => {
      if (url?.trim()) {
        const result = validateUrl(url)
        if (!result.isValid) {
          errors[platform] = [result.error]
          isValid = false
        }
      }
    })

    return { isValid, errors }
  }

  return {
    // Constants
    MAX_BIO_WORDS,
    MAX_BIO_CHARS,

    // Methods
    validateUrl,
    validateBio,
    validateSocialLinks,
  }
}
