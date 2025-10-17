// stores/useEmailVerificationStore.ts

interface EmailVerificationState {
  isProcessing: boolean
  verificationStep: 'idle' | 'sending' | 'codeSent' | 'verifying' | 'completed'
  error: string | null
}

export const useEmailVerificationStore = defineStore(
  'emailVerification',
  () => {
    const { $axios } = useNuxtApp()

    // State
    const state = reactive<EmailVerificationState>({
      isProcessing: false,
      verificationStep: 'idle',
      error: null,
    })

    // Actions
    const sendVerificationCode = async (email: string) => {
      state.isProcessing = true
      state.error = null
      state.verificationStep = 'sending'

      try {
        const response = await $axios.post('/auth/email/send-verification', {
          email,
        })

        state.verificationStep = 'codeSent'
        return response.data
      } catch (error: any) {
        state.verificationStep = 'idle'
        handleStoreError(error)
        throw error
      } finally {
        state.isProcessing = false
      }
    }

    const verifyCurrentEmail = async (email: string, code: string) => {
      state.isProcessing = true
      state.error = null

      try {
        const response = await $axios.post('/auth/email/verify-current', {
          email,
          code,
        })

        state.verificationStep = 'completed'
        return response.data
      } catch (error: any) {
        handleStoreError(error)
        throw error
      } finally {
        state.isProcessing = false
      }
    }

    const updateEmail = async (newEmail: string) => {
      state.isProcessing = true
      state.error = null

      try {
        const response = await $axios.post('/auth/email/update', {
          email: newEmail,
        })

        state.verificationStep = 'completed'
        return response.data // Will include both message and user data
      } catch (error: any) {
        handleStoreError(error)
        throw error
      } finally {
        state.isProcessing = false
      }
    }

    const handleStoreError = (error: any) => {
      console.error('API Error:', error.response || error)
      state.error =
        error.response?.data?.message || 'An unexpected error occurred'
    }

    const resetState = () => {
      state.verificationStep = 'idle'
      state.error = null
    }

    return {
      state: readonly(state),
      sendVerificationCode,
      verifyCurrentEmail,
      updateEmail,
      resetState,
    }
  }
)
