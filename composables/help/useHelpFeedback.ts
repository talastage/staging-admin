import { ref } from 'vue'
import type { HelpFeedback } from '@/types/help'
import { useSnackMessageStore } from '@/stores/useSnackMessage'

export function useHelpFeedback(articleId: number) {
  const snackStore = useSnackMessageStore()
  const isSubmittingFeedback = ref(false)
  const hasSubmittedFeedback = ref(false)
  const feedback = ref<HelpFeedback | null>(null)

  const loadFeedback = async () => {
    try {
      const { $axios } = useNuxtApp()
      const response = await $axios.get(`/api/help/feedback/${articleId}`)
      feedback.value = response.data
    } catch (error) {
      console.error('Failed to load help feedback:', error)
      snackStore.error('Failed to load feedback statistics')
    }
  }

  const submitFeedback = async (isHelpful: boolean) => {
    if (hasSubmittedFeedback.value) return

    isSubmittingFeedback.value = true

    try {
      const { $axios } = useNuxtApp()
      const response = await $axios.post(`/api/help/feedback/${articleId}`, {
        isHelpful,
      })

      feedback.value = response.data
      hasSubmittedFeedback.value = true
      localStorage.setItem(`help_feedback_${articleId}`, 'true')

      snackStore.success('Thank you for your feedback!')
    } catch (error: any) {
      if (error.response?.status === 409) {
        snackStore.warning(
          'You have already submitted feedback for this article'
        )
      } else {
        snackStore.error('Failed to submit feedback. Please try again.')
      }
    } finally {
      isSubmittingFeedback.value = false
    }
  }

  const checkPreviousFeedback = () => {
    const hasFeedback = localStorage.getItem(`help_feedback_${articleId}`)
    hasSubmittedFeedback.value = Boolean(hasFeedback)
  }

  return {
    feedback,
    isSubmittingFeedback,
    hasSubmittedFeedback,
    loadFeedback,
    submitFeedback,
    checkPreviousFeedback,
  }
}
