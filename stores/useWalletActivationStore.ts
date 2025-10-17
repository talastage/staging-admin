// stores/useWalletActivationStore.ts
import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import type { AxiosError } from 'axios'
import { isAxiosError } from 'axios'
import { useWalletStore } from './useWalletStore'
import { ref, reactive } from 'vue'

interface AuthResponse {
  authorized: boolean
  expires_at?: string
  message?: string
}

interface ActivationError {
  message: string
  details?: string
  status?: number
  code?: string
}

export const useWalletActivationStore = defineStore('wallet-activation', () => {
  const { $axios } = useNuxtApp()
  const walletStore = useWalletStore()

  // State
  const isLoading = ref(false)
  const activationMethod = ref('email')
  const canActivateByEmail = ref(true)
  const activationStatus = reactive({
    isActivated: false,
    isPending: false,
    lastAttempt: null as Date | null,
  })

  // Error handling
  const handleActivationError = (err: unknown): never => {
    if (isAxiosError(err)) {
      const axiosError = err as AxiosError<any>
      const errorData: ActivationError = {
        message: axiosError.response?.data?.message || axiosError.message,
        details: axiosError.response?.data?.details,
        status: axiosError.response?.status,
        code: axiosError.response?.data?.code,
      }
      throw errorData
    }
    const genericError: ActivationError = {
      message:
        err instanceof Error ? err.message : 'An unexpected error occurred',
    }
    throw genericError
  }

  // Check if user is eligible for wallet activation
  const checkActivationEligibility = async () => {
    try {
      isLoading.value = true
      const { data } = await $axios.get('/api/wallet/activation/eligibility')
      canActivateByEmail.value = data.canActivateByEmail || false
      activationStatus.isActivated = data.isActivated || false
      activationStatus.isPending = data.isPending || false
      return data
    } catch (error) {
      return handleActivationError(error)
    } finally {
      isLoading.value = false
    }
  }

  // Send activation code to user's email
  // In useWalletActivationStore.ts
  const sendActivationCode = async () => {
    try {
      isLoading.value = true
      const { data } = await $axios.post('/api/wallet/activation/send-code', {
        method: activationMethod.value,
      })
      activationStatus.lastAttempt = new Date()
      activationStatus.isPending = true
      return data
    } catch (error) {
      return handleActivationError(error)
    } finally {
      isLoading.value = false
    }
  }

  // Verify activation code entered by user
  const verifyActivationCode = async (code: string) => {
    try {
      isLoading.value = true
      const { data } = await $axios.post('/api/wallet/activation/verify-code', {
        code,
        method: activationMethod.value,
      })

      if (data.authorized) {
        activationStatus.isPending = false
        // We don't set isActivated to true yet because currency selection is still needed
      }

      return data
    } catch (error) {
      return handleActivationError(error)
    } finally {
      isLoading.value = false
    }
  }

  // Resend activation code
  const resendActivationCode = async () => {
    try {
      isLoading.value = true
      const { data } = await $axios.post('/api/wallet/activation/resend-code', {
        method: activationMethod.value,
      })
      activationStatus.lastAttempt = new Date()
      return data
    } catch (error) {
      return handleActivationError(error)
    } finally {
      isLoading.value = false
    }
  }

  // Complete wallet activation (after currency selection)
  const completeActivation = async (currencyId?: number) => {
    try {
      isLoading.value = true
      const payload = currencyId ? { currency_id: currencyId } : {}
      const { data } = await $axios.post(
        '/api/wallet/activation/complete',
        payload
      )

      if (data.success) {
        activationStatus.isActivated = true
        activationStatus.isPending = false
        await walletStore.fetchWallet()
      }

      return data
    } catch (error) {
      return handleActivationError(error)
    } finally {
      isLoading.value = false
    }
  }

  // Legacy methods (keeping for backward compatibility)
  const verifyPin = async (pin: string): Promise<AuthResponse> => {
    try {
      const { data } = await $axios.post<AuthResponse>(
        '/api/wallet/verify-generated-pin',
        { pin }
      )
      if (data.authorized) {
        walletStore.setAuthenticated(true)
        if (data.expires_at) {
          walletStore.setSessionExpiry(data.expires_at)
        }
        await walletStore.fetchWallet()
      }
      return data
    } catch (error) {
      return handleActivationError(error)
    }
  }

  const generateNewPin = async (
    email: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const { data } = await $axios.post('/api/wallet/generate-pin', { email })
      return data
    } catch (error) {
      return handleActivationError(error)
    }
  }

  const verifyGeneratedPin = async (pin: string): Promise<AuthResponse> => {
    try {
      const { data } = await $axios.post<AuthResponse>(
        '/api/wallet/verify-generated-pin',
        { pin }
      )
      if (data.authorized) {
        walletStore.setAuthenticated(true)
        if (data.expires_at) {
          walletStore.setSessionExpiry(data.expires_at)
        }
        await walletStore.fetchWallet()
      }
      return data
    } catch (error) {
      return handleActivationError(error)
    }
  }

  return {
    // State
    isLoading,
    activationMethod,
    canActivateByEmail,
    activationStatus,

    // Methods
    checkActivationEligibility,
    sendActivationCode,
    verifyActivationCode,
    resendActivationCode,
    completeActivation,

    // Legacy methods
    verifyPin,
    generateNewPin,
    verifyGeneratedPin,
  }
})
